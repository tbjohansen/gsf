import { useState } from "react";
import {
  LuUser,
  LuLayoutDashboard,
  LuSettings,
  LuUsers,
  LuChevronUp,
  LuChevronDown,
  LuArrowLeft,
  LuFileUser,
  LuFileUp,
} from "react-icons/lu";
import { MdOutlineListAlt } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { BiBuildingHouse } from "react-icons/bi";

// SideBar Component
const SideBar = ({
  mobileOpen,
  handleDrawerToggle,
  sidebarOpen,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [hoveredLink, setHoveredLink] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserLinks, setShowUserLinks] = useState(false);

  const mainLinks = [
    { id: 1, name: "Overview", icon: LuLayoutDashboard, url: "/home" },
    {
      id: 2,
      name: "Hostels",
      icon: BiBuildingHouse,
      url: "/hostels",
      // hasSubmenu: true,
      // submenu: [
      //   {
      //     id: 21,
      //     icon: MdOutlineBedroomParent,
      //     name: "New",
      //     url: "/hostels/available",
      //   },
      //   {
      //     id: 22,
      //     icon: MdOutlineBedroomParent,
      //     name: "Setups",
      //     url: "/hostels/unavailable",
      //   },
      // ],
    },
    { id: 3, name: "Items", icon: MdOutlineListAlt, url: "/items" },
    { id: 4, name: "Customers", icon: LuFileUser, url: "/customers" },
    { id: 8, name: "Users", icon: LuUsers, url: "/users" },
    // { id: 9, name: "Settings", icon: LuSettings, url: "/settings" },
  ];

  const userLinks = [
    { id: 81, name: "Profile", icon: LuUser, url: "/profile/view" },
    { id: 82, name: "Manage Users", icon: LuUsers, url: "/profile/manage" },
    {
      id: 83,
      name: "Permissions",
      icon: LuSettings,
      url: "/profile/permissions",
    },
    {
      id: 84,
      name: "User Activity",
      icon: LuLayoutDashboard,
      url: "/profile/activity",
    },
  ];

  const links = showUserLinks ? userLinks : mainLinks;

  // const handleLinkClick = (url, hasUserMenu) => {
  //   if (hasUserMenu) {
  //     setShowUserLinks(true);
  //     setIsExpanded(false);
  //   } else {
  //     setActiveLink(url);
  //     if (mobileOpen) handleDrawerToggle();
  //   }
  // };

  const handleLinkClick = (url, hasUserMenu) => {
    if (hasUserMenu) {
      setShowUserLinks(true);
      setIsExpanded(false);
    } else {
      navigate(url); // Add this to actually navigate
      if (mobileOpen) handleDrawerToggle();
    }
  };

  const handleBackClick = () => {
    setShowUserLinks(false);
    setIsExpanded(false);
  };

  const toggleSubMenu = () => {
    setIsExpanded(!isExpanded);
  };

  const NavItem = ({ link, isActive, isOpen }) => {
    const Icon = link.icon;
    const isHovered = hoveredLink === link.id;
    const isSubmenu = link.hasSubmenu;

    return (
      <div className="relative">
        <div
          onClick={() => {
            if (isSubmenu) {
              toggleSubMenu();
              if (!isExpanded) {
                handleLinkClick(link.url);
              }
            } else {
              setIsExpanded(false);
              handleLinkClick(link.url, link.hasUserMenu);
            }
          }}
          onMouseEnter={() => setHoveredLink(link.id)}
          onMouseLeave={() => setHoveredLink(null)}
          className={`
            group relative flex gap-3 px-4 py-3 my-2 cursor-pointer
            transition-all duration-300 ease-in-out
            ${isActive ? "bg-tint" : "hover:bg-orange-500/10"}
            before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
            before:w-1 before:h-0 before:bg-blue-900 before:transition-all before:duration-300
            ${!isActive && "hover:before:h-full"}
            ${!isOpen && "justify-center"}
          `}
        >
          <Icon
            className={`w-6 h-6 transition-colors duration-300 flex-shrink-0 ${
              isActive ? "text-oceanic" : "text-gray-200 opacity-90"
            }`}
          />
          <span
            className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              isActive ? "text-oceanic" : "text-gray-200"
            } ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
          >
            {link.name}
          </span>
          {isSubmenu && isOpen && (
            <div
              className={`transition-transform duration-300 w-full flex justify-end`}
            >
              {isExpanded ? (
                <LuChevronUp
                  className={`w-4 h-4 ${
                    isActive ? "text-oceanic" : "text-gray-200"
                  }`}
                />
              ) : (
                <LuChevronDown
                  className={`w-4 h-4 ${
                    isActive ? "text-oceanic" : "text-gray-200"
                  }`}
                />
              )}
            </div>
          )}
        </div>

        {/* Submenu */}
        {isSubmenu && isExpanded && isOpen && (
          <div className="ml-4 overflow-hidden transition-all duration-300">
            {link.submenu.map((subItem) => {
              const SubIcon = subItem.icon;
              return (
                <div
                  key={subItem.id}
                  onClick={() => handleLinkClick(subItem.url)}
                  className={`
                  flex items-center gap-3 px-4 py-2 my-1 cursor-pointer
                  transition-all duration-300 ease-in-out
                  ${
                    activeLink === subItem.url
                      ? "bg-tint"
                      : "hover:bg-amber-500/10"
                  }
                `}
                >
                  <SubIcon
                    className={`w-4 h-4 transition-colors duration-300 flex-shrink-0 ${
                      activeLink === subItem.url
                        ? "text-oceanic"
                        : "text-gray-200 opacity-90"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      activeLink === subItem.url
                        ? "text-oceanic font-medium"
                        : "text-gray-200"
                    }`}
                  >
                    {subItem.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const DrawerContent = ({ isOpen }) => (
    <div className="h-full flex flex-col">
      <div className="h-16" />
      <div className="border-t border-blue-800/30" />

      {/* Back Button */}
      {showUserLinks && (
        <div
          onClick={handleBackClick}
          className={`
            flex items-center gap-3 px-4 py-3 mt-4 mx-2 cursor-pointer
            transition-all duration-300 ease-in-out
            hover:bg-orange-500/10 rounded-lg
            ${!isOpen && "justify-center"}
          `}
        >
          <LuArrowLeft className="w-6 h-6 text-gray-200 flex-shrink-0" />
          <span
            className={`text-sm font-medium text-gray-200 transition-all duration-300 whitespace-nowrap ${
              isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            Back to Menu
          </span>
        </div>
      )}

      <nav className="flex-1 py-4 overflow-y-auto">
        {links.map((link) => {
          const isActive =
            location.pathname === link.url ||
            (link.hasSubmenu &&
              link.submenu.some((sub) => location.pathname === sub.url));

          return (
            <NavItem
              key={link.id}
              link={link}
              isActive={isActive}
              isOpen={isOpen}
            />
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          onClick={handleDrawerToggle}
          className="sm:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      <aside
        className={`
          sm:hidden fixed top-0 left-0 h-full w-[70%] bg-oceanic z-40
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <DrawerContent isOpen={true} />
      </aside>

      <aside
        className={`hidden sm:block fixed top-0 left-0 h-full bg-oceanic z-20 transition-all duration-300 ${
          sidebarOpen ? "w-52" : "w-16"
        }`}
      >
        <DrawerContent isOpen={sidebarOpen} />
      </aside>
    </>
  );
};

export default SideBar;
