import toast from "react-hot-toast";
import { Input } from "../components/Input";
import { useState } from "react";
import apiClient from "../api/Client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    if (!username) {
      return toast.error("Please fill in valid username");
    }
    if (!password) {
      return toast.error("Please fill in valid password");
    }

    let data = {
      email: username,
      password,
    };

    console.log(data);

    if (!loading) {
      setLoading(true);

      try {
        const response = await apiClient.post(`/login`, data);

        console.log(response);

        // Check if apisauce request was successful
        if (!response.ok) {
          setLoading(false);

          // Handle apisauce problem types
          if (response.problem === "NETWORK_ERROR") {
            toast.error("Network error. Please check your connection");
          } else if (response.problem === "TIMEOUT_ERROR") {
            toast.error("Request timeout. Please try again");
          } else if (response.problem === "CONNECTION_ERROR") {
            toast.error("Connection error. Please check your internet");
          } else {
            toast.error("An error occurred. Please try again");
          }
          return;
        }

        // Check if response contains an error (your API pattern)
        if (response.data?.error || response.data?.code >= 400) {
          setLoading(false);
          const errorMessage = response.data.error;
          const errorCode = response.data.code;

          if (errorCode === 401) {
            toast.error(errorMessage || "Invalid credentials");
          } else if (errorCode === 403) {
            toast.error(errorMessage || "Access denied");
          } else if (errorCode === 404) {
            toast.error(errorMessage || "User not found");
          } else {
            toast.error(errorMessage || "An error occurred. Please try again");
          }
          return;
        }

        // Extract token and user info from successful response
        const { authorization, employee } = response.data.data;

        // Store access token in localStorage
        if (authorization?.access_token) {
          localStorage.setItem("authToken", authorization.access_token);
          localStorage.setItem("tokenType", authorization.token_type);
          localStorage.setItem(
            "expiresIn",
            authorization.expires_in.toString()
          );

          // Calculate and store expiration timestamp
          const expirationTime = Date.now() + authorization.expires_in * 1000;
          localStorage.setItem("tokenExpiration", expirationTime.toString());
        }

        // Store employee info in localStorage
        if (employee) {
          localStorage.setItem("userInfo", JSON.stringify(employee));
          localStorage.setItem("employeeId", employee.Employee_ID.toString());
          localStorage.setItem("userName", employee.name);
          localStorage.setItem("userEmail", employee.email);
        }

        // Set token in API client headers for future requests using apisauce method
        if (authorization?.access_token) {
          apiClient.setHeader(
            "Authorization",
            `${authorization.token_type} ${authorization.access_token}`
          );
        }

        toast.success("You logged in successfully. Redirecting...");
        setLoading(false);

        setTimeout(() => {
          navigate(`/`);
        }, 1500);
      } catch (error) {
        console.log(error);
        setLoading(false);

        // Handle unexpected errors (shouldn't happen with apisauce normally)
        toast.error("An unexpected error occurred. Please try again");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img
                alt="GPITG"
                src="../../logos/logo.png"
                className="mx-auto h-10 w-auto"
              />
              <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                Sign in to your account
              </h2>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      submit();
                    }
                  }}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

            
              <button
                onClick={() => submit()}
                disabled={loading}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white font-medium rounded-md cursor-pointer transition-all duration-300 shadow-lg hover:shadow-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

          
            <p className="mt-6 text-center text-sm text-gray-600">
              Not registered?{" "}
              <span className="text-gray-900 font-medium">
                Please contact an administrator
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
