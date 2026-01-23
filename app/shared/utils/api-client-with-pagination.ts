import { ApiAction, ApiCallOptions } from "../types/http";
import { buildApiUrl } from "./api-url-builder";

export const apiClientWithPagination = async <T = any>(
  options: ApiCallOptions & {
    page?: number;
    limit?: number;
    paginationKey?: string;
  }
) => {
  const {
    endpoint,
    action,
    setState,
    payload,
    page = 1,
    limit = 10,
    paginationKey = "pagination",
  } = options;

  setState?.({ isSearching: action === ApiAction.SEARCH });

  try {
    const requestOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store" as RequestCache,
    };

    const baseParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (action === ApiAction.SEARCH && payload) {
      baseParams.search = payload;
    }

    const url = buildApiUrl(`/api/${endpoint}`, baseParams);

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`${action} failed: ${response.statusText}`);
    }

    const data = await response.json();

    const items = data.users || data.items || data.data || data;
    const pagination = data[paginationKey] || {
      currentPage: page,
      totalPages: 1,
      totalItems: items.length,
      hasNext: false,
      hasPrev: false,
      itemsPerPage: limit,
    };

    return {
      items,
      pagination,
      rawData: data,
    };
  } catch (error) {
    console.error(`${action} error for ${endpoint}:`, error);
    throw error;
  } finally {
    if (action === ApiAction.SEARCH) setState?.({ isSearching: false });
  }
};
