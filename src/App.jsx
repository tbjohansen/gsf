import React, { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { primaryTheme } from "./assets/utils/themes";
import AppRoutes from "../routes/App.routes";
import apiClient from "./api/Client";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRefreshing = useRef(false);
  const refreshPromise = useRef(null);

  useEffect(() => {
    // Set up authentication token in API client on app load
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("tokenType");

    if (token && tokenType) {
      // Set authorization header for all API requests using apisauce method
      apiClient.setHeader("Authorization", `${tokenType} ${token}`);

      // Check if token is expired or expiring soon
      const tokenExpiration = localStorage.getItem("tokenExpiration");
      if (tokenExpiration) {
        const expirationTime = parseInt(tokenExpiration);
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        // If token expired, try to refresh it
        if (timeUntilExpiry <= 0) {
          refreshToken();
        }
        // If token expires in less than 5 minutes, proactively refresh it
        else if (timeUntilExpiry < 5 * 60 * 1000) {
          refreshToken();
        }
      }
    } else {
      // No token found, redirect to login if not already there
      console.log(location.pathname);
      console.log("were in");
      const publicRoutes = [
        "/login",
        "/forgot-password",
        "/register",
        "/students",
      ];
      if (!publicRoutes.includes(location.pathname)) {
        console.log("navigate out");
        navigate("/login");
      }
    }

    // Set up axios interceptor for handling 401 errors (apisauce uses axios internally)
    const interceptor = apiClient.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Try to refresh the token
          const refreshed = await refreshToken();

          if (refreshed) {
            // Retry the original request with new token
            const newToken = localStorage.getItem("authToken");
            const newTokenType = localStorage.getItem("tokenType");
            originalRequest.headers[
              "Authorization"
            ] = `${newTokenType} ${newToken}`;
            return apiClient.axiosInstance(originalRequest);
          } else {
            // Refresh failed, logout user
            handleTokenExpiration();
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    // Set up interval to check token expiration every minute
    const tokenCheckInterval = setInterval(() => {
      const tokenExpiration = localStorage.getItem("tokenExpiration");
      if (tokenExpiration) {
        const expirationTime = parseInt(tokenExpiration);
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        // Refresh token if it expires in less than 5 minutes
        if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
          refreshToken();
        }
      }
    }, 60000); // Check every minute

    // Cleanup interceptor and interval on unmount
    return () => {
      apiClient.axiosInstance.interceptors.response.eject(interceptor);
      clearInterval(tokenCheckInterval);
    };
  }, [navigate, location.pathname]);

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return false;

      // Call your refresh token API endpoint
      // Adjust the endpoint based on your backend API
      const response = await apiClient.post("/refresh");

      // Apisauce returns { ok, data, problem, ... }
      if (!response.ok) {
        console.log("Token refresh failed:", response.problem);
        return false;
      }

      // Check if response contains error
      if (response.data?.error || response.data?.code >= 400) {
        console.log("Token refresh failed:", response.data.error);
        return false;
      }

      // Extract new token from response
      const { authorization } = response.data.data;

      if (authorization?.access_token) {
        // Update token in localStorage
        localStorage.setItem("authToken", authorization.access_token);
        localStorage.setItem("tokenType", authorization.token_type);
        localStorage.setItem("expiresIn", authorization.expires_in.toString());

        // Calculate and store new expiration timestamp
        const expirationTime = Date.now() + authorization.expires_in * 1000;
        localStorage.setItem("tokenExpiration", expirationTime.toString());

        // Update authorization header using apisauce method
        apiClient.setHeader(
          "Authorization",
          `${authorization.token_type} ${authorization.access_token}`
        );

        console.log("Token refreshed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }

    isRefreshing.current = true;

    refreshPromise.current = (async () => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const currentToken = localStorage.getItem("authToken");

        if (!currentToken && !refreshToken) {
          console.log("No tokens available for refresh");
          return false;
        }

        // Temporarily remove auth header to avoid using expired token
        apiClient.deleteHeader("Authorization");

        // Call your refresh token API endpoint
        // Use the refresh token if available, otherwise try with current token
        const response = await apiClient.post("/refresh", {
          refresh_token: refreshToken,
          token: currentToken,
        });

        // Apisauce returns { ok, data, problem, ... }
        if (!response.ok) {
          console.log("Token refresh failed:", response.problem, response.data);
          return false;
        }

        // Check if response contains error
        if (response.data?.error || response.data?.code >= 400) {
          console.log("Token refresh failed with error:", response.data.error);
          return false;
        }

        // Handle different response structures
        let newToken, tokenType, expiresIn;

        if (response.data.data?.authorization) {
          // Your current structure
          const { authorization } = response.data.data;
          newToken = authorization.access_token;
          tokenType = authorization.token_type;
          expiresIn = authorization.expires_in;
        } else if (response.data.data?.access_token) {
          // Alternative structure
          newToken = response.data.data.access_token;
          tokenType = response.data.data.token_type || "Bearer";
          expiresIn = response.data.data.expires_in;
        } else if (response.data?.access_token) {
          // Direct response structure
          newToken = response.data.access_token;
          tokenType = response.data.token_type || "Bearer";
          expiresIn = response.data.expires_in;
        }

        if (newToken) {
          // Update token in localStorage
          localStorage.setItem("authToken", newToken);
          localStorage.setItem("tokenType", tokenType);

          // Calculate and store new expiration timestamp
          const expirationTime = Date.now() + expiresIn * 1000;
          localStorage.setItem("tokenExpiration", expirationTime.toString());

          // Store refresh token if provided
          if (
            response.data.data?.refresh_token ||
            response.data?.refresh_token
          ) {
            localStorage.setItem(
              "refreshToken",
              response.data.data?.refresh_token || response.data?.refresh_token
            );
          }

          // Update authorization header using apisauce method
          apiClient.setHeader("Authorization", `${tokenType} ${newToken}`);

          console.log("Token refreshed successfully");
          return true;
        } else {
          console.log("No new token received in refresh response");
          return false;
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        return false;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  };

  const handleTokenExpiration = () => {
    // Clear all authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    // Remove authorization header using apisauce method
    apiClient.deleteHeader("Authorization");

    // Redirect to login
    navigate("/login");
  };

  return (
    <React.Fragment>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#363636",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <ThemeProvider theme={primaryTheme}>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
