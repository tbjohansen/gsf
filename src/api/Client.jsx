import { create } from "apisauce";

const apiClient = create({
  baseURL: "http://41.188.172.117/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to attach token to every request
apiClient.axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("tokenType");

    if (token && tokenType) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.axiosInstance.interceptors.response.use(
  (response) => {
    // Check if response contains error even in 200 status
    if (response.data?.error || response.data?.code >= 400) {
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
    }

    // Handle specific HTTP status codes
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          console.log("Unauthorized - Token may be expired");
          break;
        case 403:
          console.log("Forbidden - Access denied");
          break;
        case 404:
          console.log("Not Found - Endpoint does not exist");
          break;
        case 500:
          console.log("Server Error - Internal server error");
          break;
        case 503:
          console.log("Service Unavailable - Server is down");
          break;
        default:
          console.log(`HTTP Error ${status}`);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to set auth token
export const setAuthToken = (token, tokenType = "Bearer") => {
  if (token) {
    apiClient.setHeader("Authorization", `${tokenType} ${token}`);
  } else {
    apiClient.deleteHeader("Authorization");
  }
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  apiClient.deleteHeader("Authorization");
};

export default apiClient;
