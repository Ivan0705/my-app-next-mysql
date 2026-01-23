export const buildApiUrl = (
  endPoint: string,
  params?: Record<
    string,
    string | number | boolean | null | undefined | unknown
  >,
  baseUrl?: string
) => {
  let effectiveBaseUrl = baseUrl;

  if (!effectiveBaseUrl) {
    if (typeof window !== "undefined") {
      effectiveBaseUrl = window.location.origin;
    } else {
      effectiveBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    }
  }

  const url = new URL(endPoint, effectiveBaseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.pathname + url.search;
};
