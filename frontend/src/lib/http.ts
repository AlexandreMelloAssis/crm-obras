import axios, { type AxiosRequestConfig } from "axios";
import { API_BASE_URL, API_FALLBACK_BASE_URLS, STORAGE_KEYS } from "@/lib/constants";
import { clearToken, getToken } from "@/shared/utils/authToken";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
  // In development, we may use self-signed certificates
  ...(process.env.NODE_ENV === "development" && {
    httpsAgent: undefined, // Let axios handle it
  }),
});

type RetryableRequestConfig = AxiosRequestConfig & {
  __baseUrlRetryIndex?: number;
};

api.interceptors.request.use((config) => {
  const token = getToken();

  if (typeof window !== "undefined") {
    const workId = window.localStorage.getItem(STORAGE_KEYS.CURRENT_WORK);
    if (workId) {
      config.headers = config.headers ?? {};
      config.headers["X-Work-Id"] = workId;
    }
  }

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestConfig = (error?.config || {}) as RetryableRequestConfig;

    if (!error?.response && API_FALLBACK_BASE_URLS.length > 0) {
      const retryIndex = requestConfig.__baseUrlRetryIndex ?? 0;
      const fallbackBaseUrl = API_FALLBACK_BASE_URLS[retryIndex];

      if (fallbackBaseUrl) {
        requestConfig.__baseUrlRetryIndex = retryIndex + 1;
        requestConfig.baseURL = fallbackBaseUrl;
        return api.request(requestConfig);
      }
    }

    const status = error?.response?.status;
    if (status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export type ApiError = {
  message: string;
  details?: Record<string, string[]>;
  statusCode?: number;
};

export default api;
