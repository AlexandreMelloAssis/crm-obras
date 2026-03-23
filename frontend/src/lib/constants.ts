const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:5000/api/v1";
const LEGACY_LOCAL_HTTPS_API_BASE_URL = "https://localhost:62487/api/v1";

const envApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const envFallbackBaseUrls = (process.env.NEXT_PUBLIC_API_FALLBACK_BASE_URLS ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

export const API_BASE_URL = envApiBaseUrl || DEFAULT_LOCAL_API_BASE_URL;

export const API_FALLBACK_BASE_URLS = Array.from(
  new Set([
    ...envFallbackBaseUrls,
    DEFAULT_LOCAL_API_BASE_URL,
    LEGACY_LOCAL_HTTPS_API_BASE_URL,
  ])
).filter((url) => url !== API_BASE_URL);

export const STORAGE_KEYS = {
  TOKEN: "crm-obras:token",
  CURRENT_WORK: "crm-obras:current-work",
  THEME: "crm-obras:theme",
};
