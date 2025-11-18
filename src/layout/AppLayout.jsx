import { useState } from "react";
import TopBar from "./TopBar";
import SideBar from "./Sidebar";

// AppLayout Component
const AppLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <TopBar
        handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <SideBar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main
        className={`flex-1 pt-20 bg-blue-50 w-[100%] transition-all duration-300 ${
          sidebarOpen ? "sm:pl-52" : "sm:pl-16"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
