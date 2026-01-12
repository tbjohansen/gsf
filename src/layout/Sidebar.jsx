import { useState, useEffect } from "react";
import {
  LuLayoutDashboard,
  LuUsers,
  LuFileUser,
} from "react-icons/lu";
import {
  MdOutlineListAlt,
  MdOutlinePropaneTank,
} from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { FcMoneyTransfer } from "react-icons/fc";
import { AiOutlineFundProjectionScreen } from "react-icons/ai";
import { BsBoxes, BsClipboardPlus, BsPeople } from "react-icons/bs";
import { HiOutlineInboxArrowDown } from "react-icons/hi2";
import { MdOutlineWorkOutline } from "react-icons/md";

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLinks, setCurrentLinks] = useState([]);

  // Default main links
  const mainLinks = [
    { id: 1, name: "Overview", icon: LuLayoutDashboard, url: "/home" },
    { id: 70, name: "Projects", icon: AiOutlineFundProjectionScreen, url: "/projects" },
    { id: 6, name: "Customers", icon: LuFileUser, url: "/customers" },
    { id: 7, name: "Payments", icon: FcMoneyTransfer, url: "/payments" },
    { id: 8, name: "Items", icon: MdOutlineListAlt, url: "/items" }, 
    { id: 9, name: "Users", icon: LuUsers, url: "/users" },
  ];

  // Oxygen customer links
  const oxygenCustomerLinks = [
    { id: 1, name: "POS", icon: LuLayoutDashboard, url: "/pos" },
    { id: 2, name: "Orders", icon: MdOutlinePropaneTank, url: "/oxygen-customer/orders" },
    { id: 3, name: "Payments", icon: FcMoneyTransfer, url: "/oxygen-customer/payments" },
    { id: 4, name: "Profile", icon: LuFileUser, url: "/profile" },
  ];

  // Houses customer links
  const housesCustomerLinks = [
    { id: 1, name: "Units", icon: LuLayoutDashboard, url: "/units" },
    { id: 82, name: "Requests", icon: HiOutlineInboxArrowDown, url: "/customer-requests" },
    { id: 83, name: "Payments", icon: FcMoneyTransfer, url: "/customer-payments" },
    { id: 4, name: "Profile", icon: LuFileUser, url: "/profile" },
  ];

  // Check employee data and set appropriate links
  useEffect(() => {
    const employeeData = localStorage.getItem('userInfo');

    // console.log(employeeData);
    
    if (employeeData) {
      try {
        const employee = JSON.parse(employeeData);
        const customer = employee?.customer;
        
        if (customer && customer.Customer_Nature) {
          const customerNature = customer.Customer_Nature.toLowerCase();
          
          if (customerNature === "oxygen") {
            setCurrentLinks(oxygenCustomerLinks);
          } else if (customerNature === "house_rent") {
            setCurrentLinks(housesCustomerLinks);
          } else {
            setCurrentLinks(mainLinks);
          }
        } else {
          // Customer is null, show default links
          setCurrentLinks(mainLinks);
        }
      } catch (error) {
        console.error("Error parsing employee data:", error);
        setCurrentLinks(mainLinks);
      }
    } else {
      // No employee data, show default links
      setCurrentLinks(mainLinks);
    }
  }, []);

  const handleLinkClick = (url) => {
    // Don't navigate if already on the same page
    if (location.pathname === url) return;

    // Start transition
    setIsTransitioning(true);

    // Navigate after a short delay for smooth effect
    setTimeout(() => {
      navigate(url);
      
      // End transition
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 150);

    if (mobileOpen) handleDrawerToggle();
  };

  const NavItem = ({ link, isActive, isOpen }) => {
    const Icon = link.icon;

    return (
      <div className="relative">
        <div
          onClick={() => handleLinkClick(link.url)}
          onMouseEnter={() => setHoveredLink(link.id)}
          onMouseLeave={() => setHoveredLink(null)}
          className={`
            group relative flex gap-2 px-4 py-2.5 my-2 cursor-pointer
            transition-all duration-300 ease-in-out
            ${isActive ? "bg-[rgb(46,227,240)] w-[98%] rounded-sm" : "hover:bg-[rgb(46,227,240)] w-[98%] rounded-sm"}
            before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
            before:w-1 before:h-0 before:bg-blue-900 before:transition-all before:duration-300
            ${!isActive && "hover:before:h-full"}
            ${!isOpen && "justify-center"}
          `}
        >
          <Icon
            className={`w-5 h-5 transition-colors duration-300 flex-shrink-0 ${
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
    return (
      <div className="h-full flex flex-col">
        <div className="h-12" />
        <div className="border-t border-blue-800/30" />

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
          sm:hidden fixed top-0 left-0 h-full w-[70%] bg-[rgb(22,40,79)] z-40
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <DrawerContent isOpen={true} />
      </aside>

      <aside
        className={`hidden sm:block fixed top-0 left-0 h-full bg-[rgb(22,40,79)] z-20 transition-all duration-300 ${
          sidebarOpen ? "w-52" : "w-16"
        }`}
      >
        <DrawerContent isOpen={sidebarOpen} />
      </aside>

      {/* Transition Overlay */}
      <div
        className={`fixed inset-0 bg-white pointer-events-none z-50 transition-opacity duration-300 ${
          isTransitioning ? "opacity-20" : "opacity-0"
        }`}
      />
    </>
  );
};

export default SideBar;