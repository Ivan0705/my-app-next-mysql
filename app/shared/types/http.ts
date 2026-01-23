export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

export enum ApiAction {
  LOAD = "LOAD",
  SEARCH = "SEARCH",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export interface ApiCallOptions {
  endpoint: string;
  action: ApiAction;
  setState: (state: any) => void;
  payload?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  paginationKey?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
  rawData?: any;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  itemsPerPage: number;
}

