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

  const filteredPaths = pathSegments.filter(
    (segment) =>
      segment !== "*" &&
      !/^\d+$/.test(segment) &&
      !/^e~[A-Za-z0-9]+$/.test(segment)
  );

  const displayPaths = filteredPaths;

  const goTo = (path) => navigate(path);

  const transformDisplayText = (segment) => {
    // if (segment === "quality-assurance-works") {
    //   return "e-Claims";
    // }
    return cap(segment.replace(/-/g, " "));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 px-0.5 mb-5 backdrop-blur-sm bg-opacity-95">
      <nav className="flex items-center flex-wrap gap-2">
       
        <button
          onClick={() => goTo("/")}
          className="flex items-center text-blue-900 hover:text-blue-800 transition-all duration-300 px-2 py-0.5 rounded-xl cursor-pointer group hover:bg-blue-50 hover:shadow-sm border border-gray-200 hover:border-blue-200 active:scale-95">
          <HiHome className="mr-0.5 text-sm group-hover:scale-110 transition-transform text-blue-900" />
          <span className="text-sm">Dashboard</span>
        </button>

        {displayPaths.map((segment, idx) => {
          const originalIdx = pathSegments.indexOf(segment);
          const path = `/${pathSegments.slice(0, originalIdx + 1).join("/")}`;
          const isLast = idx === displayPaths.length - 1;
          const displayText = transformDisplayText(segment);

          return (
            <React.Fragment key={segment}>
              <div className="flex items-center text-gray-300 mx-1">
                <HiChevronRight className="text-lg transition-all duration-300 hover:text-gray-400 hover:scale-110" />
                <HiChevronRight className="text-lg -ml-3 transition-all duration-300 hover:text-gray-400 hover:scale-110 delay-75" />
              </div>
              {isLast ? (
                <>
                  <span className="text-sm text-gray-400 group-hover:translate-x-0.5 transition-transform">
                    {displayText}
                  </span>
                </>
              ) : (
                <button
                  onClick={() => goTo(path)}
                  className="flex items-center text-gray-600 hover:text-blue-900 transition-all duration-300 px-2 py-0.5 cursor-pointer active:scale-95">
                  <span className="text-sm group-hover:translate-x-0.5 transition-transform">
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
