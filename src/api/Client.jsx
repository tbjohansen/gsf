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

// Function to handle logout
const handleLogout = () => {
  // Prevent multiple redirects
  if (isRedirecting) return;
  isRedirecting = true;

  // Clear all auth-related data from localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("expiresIn");
  localStorage.removeItem("tokenExpiration");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("employeeId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("permission");

  // Clear the authorization header
  clearAuthToken();

  // Redirect to login page
  window.location.href = "/login"; // Adjust the path to your login route

  // Reset flag after redirect (though this may not execute due to page unload)
  setTimeout(() => {
    isRedirecting = false;
  }, 1000);
};

// Helper function to check if token is expired
const isTokenExpired = () => {
  const expirationTime = localStorage.getItem("tokenExpiration");
  if (!expirationTime) return false; // No expiration set, assume valid

  // Check if token is expired (with 5 minutes buffer)
  return Date.now() >= parseInt(expirationTime) - 300000;
};

// Add request interceptor to attach token to every request
apiClient.axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token check for login/refresh endpoints
    if (
      config.url?.includes("/login") ||
      config.url?.includes("/refresh-token")
    ) {
      return config;
    }

    // Check if token is expired before making request
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
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle common errors
apiClient.axiosInstance.interceptors.response.use(
  (response) => {
    // Check if response contains error even in 200 status
    if (
      response.data?.error ||
      (response.data?.code && response.data.code >= 400)
    ) {
      // Check for token expiration in success response
      const message = response?.data?.message || response?.data?.error;
      const lowerMessage = message?.toLowerCase() || "";

      if (
        response.data?.code === 401 ||
        lowerMessage.includes("token") ||
        lowerMessage.includes("expired") ||
        lowerMessage.includes("unauthorized") ||
        lowerMessage.includes("invalid") ||
        lowerMessage.includes("session")
      ) {
        handleLogout();
      }

      // Transform successful response with error data to error response
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
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject(error);
    }

    // Handle specific HTTP status codes
    const status = error.response?.status;
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

    // Check for token expiration across multiple status codes
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
        handleLogout();
        return Promise.reject(error); // Return after logout
      }
    }

    // Log other errors for debugging (can be removed in production)
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

// Helper function to set auth token with expiration
export const setAuthToken = (token, tokenType = "Bearer", expiresIn = null) => {
  if (token) {
    apiClient.setHeader("Authorization", `${tokenType} ${token}`);
    localStorage.setItem("authToken", token);
    localStorage.setItem("tokenType", tokenType);

    // Set expiration if provided
    if (expiresIn) {
      // expiresIn could be in seconds or a timestamp
      let expirationTime;
      if (typeof expiresIn === "number" && expiresIn > 10000000000) {
        // Likely a timestamp already (milliseconds)
        expirationTime = expiresIn;
      } else if (typeof expiresIn === "number") {
        // Assume seconds from now
        expirationTime = Date.now() + expiresIn * 1000;
      } else if (
        typeof expiresIn === "string" &&
        !isNaN(Date.parse(expiresIn))
      ) {
        // ISO date string
        expirationTime = Date.parse(expiresIn);
      } else {
        expirationTime = Date.now() + 3600 * 1000; // Default 1 hour
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

// Helper function to clear auth token
export const clearAuthToken = () => {
  apiClient.deleteHeader("Authorization");
  localStorage.removeItem("authToken");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("tokenExpiration");
};

// Helper function to check if user is authenticated with expiration
export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  const expiration = localStorage.getItem("tokenExpiration");

  if (!token) return false;

  // Check if token is expired
  if (expiration && Date.now() >= parseInt(expiration)) {
    // Auto logout if expired
    handleLogout();
    return false;
  }

  return true;
};

// Helper function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function to get token expiration
export const getTokenExpiration = () => {
  const expiration = localStorage.getItem("tokenExpiration");
  return expiration ? parseInt(expiration) : null;
};

// Helper function to refresh token (implement based on your API)
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken"); // You'll need to store this
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post("/refresh-token", {
      refresh_token: refreshToken,
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

// Helper function to setup automatic token refresh
export const setupTokenRefresh = () => {
  const expiration = getTokenExpiration();
  if (!expiration) return;

  const timeUntilExpiry = expiration - Date.now();
  const refreshTime = timeUntilExpiry - 300000; // Refresh 5 minutes before expiry

  if (refreshTime > 0) {
    setTimeout(async () => {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Setup next refresh
        setupTokenRefresh();
      }
    }, refreshTime);
  }
};

// export const baseURL = "/v2";
export const baseURL = "http://41.188.172.117";

export default apiClient;
