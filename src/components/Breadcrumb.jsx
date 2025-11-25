import React from "react";
import { useLocation as useLoc, useNavigate as useNav } from "react-router-dom";
import { capitalize as cap } from "../../helpers";
import {
  HiHome,
  HiChevronRight,
  HiCog,
  HiUser,
  HiChartBar,
  HiCollection,
  HiDocumentText,
} from "react-icons/hi";

export default function Breadcrumb() {
  const { pathname } = useLoc();
  const navigate = useNav();

  const pathSegments = pathname.split("/").filter(Boolean);

  const filteredPaths = pathSegments.filter(
    (segment) =>
      segment !== "*" &&
      !/^\d+$/.test(segment) &&
      !/^e~[A-Za-z0-9]+$/.test(segment)
  );

  const displayPaths = filteredPaths;

  const goTo = (path) => navigate(path);

  // Icon mapping for common routes
  const getIconForSegment = (segment) => {
    const iconMap = {
      settings: HiCog,
      users: HiUser,
      profile: HiUser,
      analytics: HiChartBar,
      reports: HiChartBar,
      documents: HiDocumentText,
      files: HiCollection,
      hostels: HiCollection,
    };

    return iconMap[segment] || null;
  };

  const transformDisplayText = (segment) => {
    if (segment === "quality-assurance-works") {
      return "e-Claims";
    }
    return cap(segment.replace(/-/g, " "));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 px-6 py-1.5 mb-4 backdrop-blur-sm bg-opacity-95">
      <nav className="flex items-center flex-wrap gap-2">
        {/* Home/Dashboard Link */}
        <button
          onClick={() => goTo("/")}
          className="flex items-center text-blue-900 hover:text-blue-800 transition-all duration-300 px-2 py-1 rounded-xl cursor-pointer group hover:bg-blue-50 hover:shadow-sm border border-gray-200 hover:border-blue-200 active:scale-95">
          <HiHome className="text-md mr-2.5 group-hover:scale-110 transition-transform text-blue-900" />
          <span className="font-medium">Dashboard</span>
        </button>

        {displayPaths.map((segment, idx) => {
          const originalIdx = pathSegments.indexOf(segment);
          const path = `/${pathSegments.slice(0, originalIdx + 1).join("/")}`;
          const isLast = idx === displayPaths.length - 1;
          const displayText = transformDisplayText(segment);
          const SegmentIcon = getIconForSegment(segment);

          return (
            <React.Fragment key={segment}>
              {/* Animated Chevron Separators */}
              <div className="flex items-center text-gray-300 mx-1">
                <HiChevronRight className="text-lg transition-all duration-300 hover:text-gray-400 hover:scale-110" />
                <HiChevronRight className="text-lg -ml-3 transition-all duration-300 hover:text-gray-400 hover:scale-110 delay-75" />
              </div>

              {/* Breadcrumb Item */}
              {isLast ? (
                <>
                  <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                    {displayText}
                  </span>
                </>
              ) : (
                <button
                  onClick={() => goTo(path)}
                  className="flex items-center text-gray-700 hover:text-blue-700 transition-all duration-300 px-2 py-1 rounded-xl cursor-pointer group hover:bg-gray-50 hover:shadow-sm border border-gray-200 active:scale-95">
                  {SegmentIcon && (
                    <SegmentIcon className="text-lg mr-2.5 group-hover:scale-110 transition-transform text-gray-500 group-hover:text-blue-500" />
                  )}
                  <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                    {displayText}
                  </span>
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Breadcrumb Trail Display */}
      {/* {displayPaths.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs">
            <span className="text-gray-500 font-medium uppercase tracking-wide">
              Navigation Path:
            </span>
            <div className="flex items-center ml-2 text-gray-600">
              <HiHome className="text-sm mr-1" />
              <span>Dashboard</span>
              {displayPaths.map((segment, idx) => (
                <React.Fragment key={idx}>
                  <HiChevronRight className="text-xs mx-1" />
                  <span className={idx === displayPaths.length - 1 ? "text-blue-600 font-semibold" : ""}>
                    {transformDisplayText(segment)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
