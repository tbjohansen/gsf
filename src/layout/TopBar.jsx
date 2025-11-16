import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  LuMenu,
  LuX,
  LuCloud,
  LuSun,
  LuSunset,
  LuLogOut,
  LuLoader,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/Client";

// TopBar Component
const TopBar = ({
  handleDrawerToggle,
  mobileOpen,
  sidebarOpen,
  toggleSidebar,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

  // Load user info from localStorage on component mount
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error("Error parsing user info:", error);
        // If user info is corrupted, redirect to login
        navigate("/login");
      }
    } else {
      // No user info found, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  const getCurrentDate = () => {
    const date = new Date();
    const options = { weekday: "short", day: "2-digit", month: "long" };
    return date.toLocaleDateString("en-US", options);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const greeting = getGreeting();
  const date = getCurrentDate();

  const renderIcons = () => {
    if (greeting === "Good morning") {
      return (
        <div className="relative w-8 h-8">
          <LuCloud className="absolute right-2 top-1 w-5 h-5 text-blue-600" />
          <LuSunset className="absolute right-0 -top-0.5 w-4 h-4 text-blue-600" />
        </div>
      );
    } else if (greeting === "Good afternoon") {
      return (
        <div className="relative w-8 h-8">
          <LuCloud className="absolute right-2 top-1 w-5 h-5 text-blue-600" />
          <LuSun className="absolute right-0 top-0 w-5 h-5 text-blue-600" />
        </div>
      );
    } else {
      return (
        <div className="relative w-8 h-8">
          <LuCloud className="absolute right-2 top-1 w-5 h-5 text-blue-600" />
        </div>
      );
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Optional: Call logout API endpoint if your backend has one
      const token = localStorage.getItem("authToken");
      if (token) {
        const response = await apiClient.post("/logout");
        if (!response.ok) {
          // Ignore logout API errors, still clear local data
          console.log("Logout API call failed, but clearing local data");
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all stored authentication data
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenType");
      localStorage.removeItem("expiresIn");
      localStorage.removeItem("tokenExpiration");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("employeeId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");

      // Remove authorization header from API client using apisauce method
      apiClient.deleteHeader("Authorization");

      // Show success message and redirect
      toast.success("Logged out successfully");
      setIsLoggingOut(false);
      setMenuOpen(false);

      // Redirect to login page
      navigate("/login");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!userInfo) return "User";
    return userInfo.name || userInfo.email || "User";
  };

  // Show loading or nothing if user info is not loaded yet
  if (!userInfo) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDrawerToggle}
              className="sm:hidden p-2 hover:bg-blue-200/50 rounded-lg transition-colors"
            >
              {mobileOpen ? (
                <LuX className="w-6 h-6 text-blue-900" />
              ) : (
                <LuMenu className="w-6 h-6 text-blue-900" />
              )}
            </button>
            <h1 className="text-lg font-bold text-blue-900">GSF PROJECTS</h1>
          </div>

          <div className="flex items-center gap-2">
            {renderIcons()}
            <span className="hidden sm:block text-sm font-bold text-blue-900">
              {greeting}, {getUserDisplayName()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs font-bold text-blue-900">
              {date}
            </span>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center border-2 border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
              >
                {getInitials(userInfo.name)}
              </button>

              {menuOpen && (
                <>
                  <div
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="absolute -top-2 right-3 w-4 h-4 bg-white transform rotate-45" />
                    <div className="relative bg-white">
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm">
                          {getInitials(userInfo.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {userInfo.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {userInfo.email}
                          </span>
                        </div>
                      </button>
                      <div className="border-t border-gray-200" />
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left disabled:opacity-50"
                      >
                        {isLoggingOut ? (
                          <>
                            <LuLoader className="w-4 h-4 text-gray-600 animate-spin" />
                            <span className="text-sm text-gray-700">
                              Logging out...
                            </span>
                          </>
                        ) : (
                          <>
                            <LuLogOut className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600">
                              Logout
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;