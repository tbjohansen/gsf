import React, { useEffect } from "react";
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
      const publicRoutes = ["/login", "/forgot-password", "/register"];
      if (!publicRoutes.includes(location.pathname)) {
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
  };

  const handleTokenExpiration = () => {
    // Clear all authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    // Remove authorization header using apisauce method
    apiClient.deleteHeader("Authorization");

    // Redirect to login
    navigate("/login");
  };

  // <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
  //   <CircularProgress color="inherit" />
  // </Backdrop>;

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
