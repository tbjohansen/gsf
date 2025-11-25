import { useState, useEffect } from "react";
import {
  LuUser,
  LuLayoutDashboard,
  LuSettings,
  LuUsers,
  LuLeaf,
  LuArrowLeft,
  LuFileUser,
  LuLandPlot,
} from "react-icons/lu";
import {
  MdOutlineListAlt,
  MdOutlineRealEstateAgent,
  MdOutlinePropaneTank,
  MdOutlineWorkOutline,
} from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { BiBuildingHouse } from "react-icons/bi";
import { RiListSettingsLine } from "react-icons/ri";
import { FcMoneyTransfer } from "react-icons/fc";
import { BsBoxes, BsClipboardPlus, BsPeople } from "react-icons/bs";
import { HiOutlineInboxArrowDown } from "react-icons/hi2";
import { FaPeopleRoof } from "react-icons/fa6";
import { PiStudent } from "react-icons/pi";

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
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const mainLinks = [
    { id: 1, name: "Overview", icon: LuLayoutDashboard, url: "/home" },
    {
      id: 2,
      name: "Hostels",
      icon: BiBuildingHouse,
      url: "/hostels",
      hasMenus: true,
    },
    {
      id: 3,
      name: "Oxygen",
      icon: MdOutlinePropaneTank,
      url: "/oxygen",
    },
    {
      id: 4,
      name: "Real Estates",
      icon: MdOutlineRealEstateAgent,
      url: "/real-estates",
      hasMenus: true,
    },
    { id: 5, name: "Customers", icon: LuFileUser, url: "/customers" },
    { id: 6, name: "Payments", icon: FcMoneyTransfer, url: "/payments" },
    { id: 7, name: "Items", icon: MdOutlineListAlt, url: "/items" }, 
    { id: 8, name: "Users", icon: LuUsers, url: "/users" },
  ];

  const hostelLinks = [
    { id: 20, name: "Hostels", icon: BiBuildingHouse, url: "/hostels/list" },
    {
      id: 21,
      name: "Students",
      icon: PiStudent,
      url: "/hostels/students",
    },
    {
      id: 22,
      name: "Items",
      icon: MdOutlineListAlt,
      url: "/hostels/items",
    },
    {
      id: 23,
      name: "Payments",
      icon: FcMoneyTransfer,
      url: "/hostels/payments",
    },
    {
      id: 24,
      name: "Setups",
      icon: RiListSettingsLine,
      url: "/hostels/setups",
    },
  ];

  const estateLinks = [
    { id: 80, name: "Units", icon: BsBoxes, url: "/real-estates/units" },
    {
      id: 81,
      name: "Features",
      icon: BsClipboardPlus,
      url: "/real-estates/features",
    },
    {
      id: 82,
      name: "Requests",
      icon: HiOutlineInboxArrowDown,
      url: "/real-estates/requests",
    },
    {
      id: 83,
      name: "Payments",
      icon: FcMoneyTransfer,
      url: "/real-estates/payments",
    },
    {
      id: 84,
      name: "Customers",
      icon: BsPeople,
      url: "/real-estates/customers",
    },
    {
      id: 85,
      name: "Employees",
      icon: MdOutlineWorkOutline,
      url: "/real-estates/employees",
    },
    {
      id: 86,
      name: "Items",
      icon: MdOutlineListAlt,
      url: "/real-estates/items",
    },
  ];

  // Map main menu items to their respective submenus
  const submenuMap = {
    "/hostels": hostelLinks,
    "/real-estates": estateLinks,
  };

  // Check if a URL belongs to any submenu
  const isSubmenuLink = (url) => {
    return Object.values(submenuMap).some((submenu) =>
      submenu.some((link) => url.startsWith(link.url))
    );
  };

  // Get the main menu URL from a submenu URL
  const getMainMenuFromSubmenu = (url) => {
    for (const [mainUrl, submenu] of Object.entries(submenuMap)) {
      if (submenu.some((link) => url.startsWith(link.url))) {
        return mainUrl;
      }
    }
    return null;
  };

  // Automatically detect which submenu to show based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    // If we're already on a submenu route, keep the same submenu
    if (activeSubmenu && isSubmenuLink(currentPath)) {
      return;
    }

    // Find if current path matches any main menu with submenus
    const activeMainMenu = mainLinks.find(
      (link) => link.hasMenus && currentPath.startsWith(link.url)
    );

    if (activeMainMenu) {
      setActiveSubmenu(activeMainMenu.url);
    } else {
      setActiveSubmenu(null);
    }
  }, [location.pathname]);

  const getCurrentLinks = () => {
    if (activeSubmenu && submenuMap[activeSubmenu]) {
      return submenuMap[activeSubmenu];
    }
    return mainLinks;
  };

  const getActiveMainMenu = () => {
    return mainLinks.find((link) => link.url === activeSubmenu);
  };

  const handleLinkClick = (url, hasMenus) => {
    if (hasMenus) {
      // For menu items with submenus, set active submenu and navigate
      setActiveSubmenu(url);
      navigate(url);
    } else {
      // For regular links, check if it's a submenu link
      const mainMenuUrl = getMainMenuFromSubmenu(url);
      if (mainMenuUrl) {
        // If it's a submenu link, keep the current submenu active
        setActiveSubmenu(mainMenuUrl);
      } else {
        // If it's a regular main menu link, clear submenu
        setActiveSubmenu(null);
      }
      navigate(url);
    }

    if (mobileOpen) handleDrawerToggle();
  };

  const handleBackClick = () => {
    setActiveSubmenu(null);
    navigate("/home");
  };

  const NavItem = ({ link, isActive, isOpen }) => {
    const Icon = link.icon;
    const isHovered = hoveredLink === link.id;

    return (
      <div className="relative">
        <div
          onClick={() => handleLinkClick(link.url, link.hasMenus)}
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
        </div>
      </div>
    );
  };

  const DrawerContent = ({ isOpen }) => {
    const currentLinks = getCurrentLinks();
    const activeMainMenu = getActiveMainMenu();

    return (
      <div className="h-full flex flex-col">
        <div className="h-16" />
        <div className="border-t border-blue-800/30" />

        {/* Back Button - Show when ANY submenu is opened */}
        {activeSubmenu && (
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
              Back to Main Menu
            </span>
          </div>
        )}

        {/* Submenu Header - Show when in submenu */}
        {activeSubmenu && activeMainMenu && (
          <div
            className={`
            px-4 py-3 border-b border-blue-800/30
            ${!isOpen && "text-center"}
          `}
          >
            <div
              className={`
              text-xs font-semibold text-gray-400 uppercase tracking-wider
              transition-all duration-300
              ${isOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}
            `}
            >
              {activeMainMenu.name} Menu
            </div>
          </div>
        )}

        <nav className="flex-1 py-4 overflow-y-auto">
          {currentLinks.map((link) => {
            const isActive =
              location.pathname === link.url ||
              location.pathname.startsWith(link.url + "/");

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
  };

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
