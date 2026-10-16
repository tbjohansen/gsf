import { create } from "apisauce";

let isRedirecting = false;

const apiClient = create({
  // baseURL: "/v2/api",
  baseURL: "http://41.188.172.117/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─────────────────────────────────────────────────────────────
// 429 RETRY CONFIGURATION
// ─────────────────────────────────────────────────────────────
const MAX_429_RETRIES = 2;
const BASE_BACKOFF_MS = 1000; // 1s, then 2s
const MAX_BACKOFF_MS = 30000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Track retry attempt count per request config
const retryCounts = new WeakMap();

// ─────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────
let isLoginRequest = false;

const handleLogout = () => {
  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.removeItem("authToken");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("expiresIn");
  localStorage.removeItem("tokenExpiration");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("employeeId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("permission");

  clearAuthToken();

  window.location.href = "/login";

  setTimeout(() => {
    isRedirecting = false;
  }, 1000);
};

const isTokenExpired = () => {
  const expirationTime = localStorage.getItem("tokenExpiration");
  if (!expirationTime) return false;
  return Date.now() >= parseInt(expirationTime) - 300000;
};

// ─────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR — attach token
// ─────────────────────────────────────────────────────────────
apiClient.axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url?.includes("/login")) {
      isLoginRequest = true;
      return config;
    }

    if (config.url?.includes("/refresh-token")) {
      return config;
    }

    if (isTokenExpired()) {
      handleLogout();
      return Promise.reject({
        message: "Token expired",
        config,
        response: { status: 401, data: { message: "Token expired" } },
      });
    }

    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("tokenType");

    if (token && tokenType) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — handle 429, success-with-error, auth failures
// ─────────────────────────────────────────────────────────────
apiClient.axiosInstance.interceptors.response.use(
  (response) => {
    isLoginRequest = false;

    // Handle 200-status responses that contain an error payload
    if (
      response.data?.error ||
      (response.data?.code && response.data.code >= 400)
    ) {
      const message = response?.data?.message || response?.data?.error;
      const lowerMessage = message?.toLowerCase() || "";

      if (
        !isLoginRequest &&
        (response.data?.code === 401 ||
          lowerMessage.includes("token") ||
          lowerMessage.includes("expired") ||
          lowerMessage.includes("unauthorized") ||
          lowerMessage.includes("invalid") ||
          lowerMessage.includes("session"))
      ) {
        handleLogout();
      }

      return Promise.reject({
        response: {
          status: response.data.code || 400,
          data: response.data,
        },
        config: response.config,
      });
    }

    return response;
  },

  async (error) => {
    // ───────────────────────────────────────────────────────
    // 1) ABORTED REQUEST — bail out silently
    // ───────────────────────────────────────────────────────
    if (
      error.code === "ERR_CANCELED" ||
      error.name === "CanceledError" ||
      error.name === "AbortError"
    ) {
      // Rejection propagates so the caller's catch can also ignore it,
      // but we tag it so components can distinguish from real errors.
      error.isAborted = true;
      return Promise.reject(error);
    }

    // ───────────────────────────────────────────────────────
    // 2) 429 HANDLING — retry with Retry-After / exponential backoff
    // ───────────────────────────────────────────────────────
    const status = error.response?.status;

    if (status === 429) {
      const config = error.config || {};

      // If the request was already aborted, don't retry
      if (config.signal?.aborted) {
        error.isAborted = true;
        return Promise.reject(error);
      }

      // Respect the server's Retry-After header if present
      const retryAfterHeader =
        error.response?.headers?.["retry-after"] ||
        error.response?.headers?.["Retry-After"];

      let waitMs;
      if (retryAfterHeader) {
        const parsedSeconds = Number(retryAfterHeader);
        if (!Number.isNaN(parsedSeconds)) {
          waitMs = parsedSeconds * 1000;
        } else {
          const parsedDate = Date.parse(retryAfterHeader);
          waitMs = Number.isNaN(parsedDate)
            ? BASE_BACKOFF_MS
            : Math.max(0, parsedDate - Date.now());
        }
      } else {
        const attempt = retryCounts.get(config) || 0;
        waitMs = Math.min(
          BASE_BACKOFF_MS * Math.pow(2, attempt),
          MAX_BACKOFF_MS,
        );
      }

      const attempt = retryCounts.get(config) || 0;

      if (attempt < MAX_429_RETRIES) {
        retryCounts.set(config, attempt + 1);
        console.warn(
          `429 received for ${config.url}. Retrying in ${waitMs}ms (attempt ${attempt + 1}/${MAX_429_RETRIES})`,
        );

        await sleep(waitMs);

        // Re-check abort status after sleeping
        if (config.signal?.aborted) {
          error.isAborted = true;
          return Promise.reject(error);
        }

        // Retry the request
        return apiClient.axiosInstance.request(config);
      }

      // Out of retries — tag and reject so the caller can toast
      retryCounts.delete(config);
      console.warn("429 retries exhausted:", config.url);
      error.is429 = true;
      error.userMessage =
        "Too many requests. Please wait a moment and try again.";
      return Promise.reject(error);
    }

    // ───────────────────────────────────────────────────────
    // 3) NETWORK ERRORS (no response)
    // ───────────────────────────────────────────────────────
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject(error);
    }

    // ───────────────────────────────────────────────────────
    // 4) AUTH FAILURES — 401 / 403 / 440
    // ───────────────────────────────────────────────────────
    const errorData = error.response?.data || {};
    const errorMessage =
      (typeof errorData?.message === "string"
        ? errorData.message.toLowerCase()
        : "") ||
      (typeof errorData?.error === "string"
        ? errorData.error.toLowerCase()
        : "") ||
      (typeof errorData?.error_description === "string"
        ? errorData.error_description.toLowerCase()
        : "") ||
      "";

    if (status === 401 || status === 403 || status === 440) {
      if (
        errorMessage.includes("token") ||
        errorMessage.includes("expired") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("session") ||
        errorMessage.includes("login") ||
        errorMessage.includes("authenticate")
      ) {
        if (!isLoginRequest) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    }

    // Reset login flag on error
    if (isLoginRequest) {
      isLoginRequest = false;
    }

    // ───────────────────────────────────────────────────────
    // 5) LOG OTHER STATUS CODES
    // ───────────────────────────────────────────────────────
    switch (status) {
      case 404:
        console.log(
          `Not Found - Endpoint does not exist: ${error.config?.url}`,
        );
        break;
      case 500:
        console.log("Server Error - Internal server error");
        break;
      case 503:
        console.log("Service Unavailable - Server is down");
        break;
      default:
        if (status >= 400) {
          console.log(`HTTP Error ${status}:`, errorMessage || error.message);
        }
    }

    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────────────────────
// PUBLIC HELPERS
// ─────────────────────────────────────────────────────────────
export const setAuthToken = (token, tokenType = "Bearer", expiresIn = null) => {
  if (token) {
    apiClient.setHeader("Authorization", `${tokenType} ${token}`);
    localStorage.setItem("authToken", token);
    localStorage.setItem("tokenType", tokenType);

    if (expiresIn) {
      let expirationTime;
      if (typeof expiresIn === "number" && expiresIn > 10000000000) {
        expirationTime = expiresIn;
      } else if (typeof expiresIn === "number") {
        expirationTime = Date.now() + expiresIn * 1000;
      } else if (
        typeof expiresIn === "string" &&
        !isNaN(Date.parse(expiresIn))
      ) {
        expirationTime = Date.parse(expiresIn);
      } else {
        expirationTime = Date.now() + 3600 * 1000;
      }

      localStorage.setItem("tokenExpiration", expirationTime.toString());
    }
  } else {
    apiClient.deleteHeader("Authorization");
    localStorage.removeItem("authToken");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("tokenExpiration");
  }
};

export const clearAuthToken = () => {
  apiClient.deleteHeader("Authorization");
  localStorage.removeItem("authToken");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("tokenExpiration");
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  const expiration = localStorage.getItem("tokenExpiration");

  if (!token) return false;

  if (expiration && Date.now() >= parseInt(expiration)) {
    handleLogout();
    return false;
  }

  return true;
};

export const getAuthToken = () => localStorage.getItem("authToken");

export const getTokenExpiration = () => {
  const expiration = localStorage.getItem("tokenExpiration");
  return expiration ? parseInt(expiration) : null;
};

export const refreshToken = async () => {
  try {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post("/refresh-token", {
      refresh_token: storedRefreshToken,
    });

    if (response.ok && response.data) {
      const { token, refresh_token, expires_in } = response.data;
      setAuthToken(token, "Bearer", expires_in);
      if (refresh_token) {
        localStorage.setItem("refreshToken", refresh_token);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    handleLogout();
    return false;
  }
};

export const setupTokenRefresh = () => {
  const expiration = getTokenExpiration();
  if (!expiration) return;

  const timeUntilExpiry = expiration - Date.now();
  const refreshTime = timeUntilExpiry - 300000; // Refresh 5 minutes before expiry

  if (refreshTime > 0) {
    setTimeout(async () => {
      const refreshed = await refreshToken();
      if (refreshed) {
        setupTokenRefresh();
      }
    }, refreshTime);
  }
};

export const resetLoginFlag = () => {
  isLoginRequest = false;
};

// export const baseURL = "/v2";
export const baseURL = "http://41.188.172.117";

export default apiClient;