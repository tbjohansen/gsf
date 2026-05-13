import React from "react";
import { useLocation as useLoc, useNavigate as useNav } from "react-router-dom";
import { capitalize as cap } from "../../helpers";
import {
  HiHome,
  HiChevronRight,
} from "react-icons/hi";

export default function Breadcrumb() {
  const { pathname } = useLoc();
  const navigate = useNav();

  const pathSegments = pathname.split("/").filter(Boolean);

  // Build display paths and track if there are more segments after each one
  const displayPaths = [];
  const originalIndices = []; // track original index in pathSegments for each display segment

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const isFiltered = segment === "*" || /^\d+$/.test(segment) || /^e~[A-Za-z0-9]+$/.test(segment);
    
    if (!isFiltered) {
      displayPaths.push(segment);
      originalIndices.push(i);
    }
  }

  const transformDisplayText = (segment) => {
    if (segment === "hostels") return "Hostels";
    if (segment === "blocks") return "Blocks";
    if (segment === "list") return "List";
    return cap(segment.replace(/-/g, " "));
  };

  const getPathForSegment = (originalIndex) => {
    return `/${pathSegments.slice(0, originalIndex + 1).join("/")}`;
  };

  if (displayPaths.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 px-0.5 mb-5 backdrop-blur-sm bg-opacity-95">
        <nav className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-blue-900 hover:text-blue-800 transition-all duration-300 px-2 py-0.5 rounded-xl cursor-pointer group hover:bg-blue-50 hover:shadow-sm border border-gray-200 hover:border-blue-200 active:scale-95">
            <HiHome className="mr-0.5 text-sm group-hover:scale-110 transition-transform text-blue-900" />
            <span className="text-sm">Dashboard</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 px-0.5 mb-5 backdrop-blur-sm bg-opacity-95">
      <nav className="flex items-center flex-wrap gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-blue-900 hover:text-blue-800 transition-all duration-300 px-2 py-0.5 rounded-xl cursor-pointer group hover:bg-blue-50 hover:shadow-sm border border-gray-200 hover:border-blue-200 active:scale-95">
          <HiHome className="mr-0.5 text-sm group-hover:scale-110 transition-transform text-blue-900" />
          <span className="text-sm">Dashboard</span>
        </button>

        {displayPaths.map((segment, idx) => {
          const originalIndex = originalIndices[idx];
          const path = getPathForSegment(originalIndex);
          const isLast = idx === displayPaths.length - 1;
          // Clickable if it's not the last display segment,
          // OR if there are any original path segments after this one (e.g. a trailing numeric ID)
          const isClickable = !isLast || originalIndex < pathSegments.length - 1;
          const displayText = transformDisplayText(segment);

          return (
            <React.Fragment key={`${segment}-${idx}`}>
              <div className="flex items-center text-gray-300 mx-1">
                <HiChevronRight className="text-lg transition-all duration-300 hover:text-gray-400 hover:scale-110" />
                <HiChevronRight className="text-lg -ml-3 transition-all duration-300 hover:text-gray-400 hover:scale-110 delay-75" />
              </div>
              {!isClickable ? (
                <span className="text-sm text-gray-400 transition-transform">
                  {displayText}
                </span>
              ) : (
                <button
                  onClick={() => navigate(path)}
                  className="flex items-center text-gray-600 hover:text-blue-900 transition-all duration-300 px-2 py-0.5 cursor-pointer active:scale-95">
                  <span className="text-sm transition-transform">
                    {displayText}
                  </span>
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}