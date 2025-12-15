import toast from "react-hot-toast";
import { useState } from "react";
import apiClient from "../api/Client";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logos/logo.png";

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

    if (!loading) {
      setLoading(true);

      try {
        const response = await apiClient.post(`/login`, data);

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
          localStorage.setItem("employeeId", employee.Employee_ID?.toString());
          localStorage.setItem("userName", employee.name);
          localStorage.setItem("userEmail", employee.email);
          localStorage.setItem("customerId", employee?.Customer_ID?.toString());
          localStorage.setItem(
            "customerOrigin",
            employee.customer_origin?.toString()
          );
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
      <style>{`
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10% {
            transform: scale(1.1);
          }
          20% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.1);
          }
          40% {
            transform: scale(1);
          }
        }
        
        .animate-heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }
      `}</style>
      <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex justify-center items-center shadow-lg animate-heartbeat">
                <img
                  alt="GSF"
                  src={logo}
                  className="h-14 w-14 object-contain"
                />
              </div>
              <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
                Sign in to your account
              </h2>
              <p className="mt-1 text-center text-sm text-gray-600">
                Enter your credentials to access your dashboard
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm bg-opacity-95 transform transition-all hover:shadow-2xl duration-300">
            <div className="space-y-5">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-blue-600">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-400"
                  />
                </div>
              </div>

              <button
                onClick={() => submit()}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white font-semibold rounded-lg cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:from-blue-800 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Not registered?{" "}
                <span className="text-gray-900 font-semibold">
                  Please contact an administrator
                </span>
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            Powered by GPITG
          </p>
        </div>
      </div>
    </>
  );
}
