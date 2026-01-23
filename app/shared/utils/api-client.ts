import { ApiAction, ApiCallOptions } from "../types/http";
import { buildApiUrl } from "./api-url-builder";

export const callApi = async (options: ApiCallOptions) => {
  const { endpoint, action, setState, payload } = options;
  setState({ isSearching: action === ApiAction.SEARCH });

  try {
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store" as RequestCache,
    };

    const searchUrl = (payload: any) =>
      buildApiUrl(`/api/${endpoint}`, { search: payload });

    const baseUrl = buildApiUrl(`/api/${endpoint}`);
    const url = action === ApiAction.SEARCH ? searchUrl(payload) : baseUrl;

    const response = await fetch(url, options);

    if (!response.ok) throw new Error(`${action} failed`);
    const data = await response.json();

    switch (endpoint) {
      case "users":
        return {
          users: action === ApiAction.LOAD ? data : null,
          searchResults: action === ApiAction.SEARCH ? data : null,
        };

      case "projects":
        return { projects: data };

      case "analytics":
        return { analytics: data };

      default:
        return { data };
    }
  } catch (error) {
    console.error(`${action} error:`, error);
    throw error;
  } finally {
    if (action === ApiAction.SEARCH) setState({ isSearching: false });
  }
};
