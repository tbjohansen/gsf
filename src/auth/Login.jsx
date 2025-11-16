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
          if (response.problem === 'NETWORK_ERROR') {
            toast.error("Network error. Please check your connection");
          } else if (response.problem === 'TIMEOUT_ERROR') {
            toast.error("Request timeout. Please try again");
          } else if (response.problem === 'CONNECTION_ERROR') {
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
          localStorage.setItem("expiresIn", authorization.expires_in.toString());
          
          // Calculate and store expiration timestamp
          const expirationTime = Date.now() + (authorization.expires_in * 1000);
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
          apiClient.setHeader('Authorization', `${authorization.token_type} ${authorization.access_token}`);
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
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
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

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            <div>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label={"Email address"}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-zodiac-950 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-oceanic hover:text-blue-zodiac-900"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      submit();
                    }
                  }}
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-zodiac-950 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                onClick={() => submit()}
                disabled={loading}
                className="flex w-full justify-center cursor-pointer rounded-md bg-oceanic px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not registered ?{" "}
            <span className="text-gray-700">
              Please contact an administrator
            </span>
          </p>
        </div>
      </div>
    </>
  );
}