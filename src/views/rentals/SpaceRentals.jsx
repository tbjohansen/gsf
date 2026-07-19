import React, { useEffect, useRef, useState } from "react";
import {
  LuSearch,
  LuMapPin,
  LuBed,
  LuBath,
  LuCar,
  LuHeart,
  LuMaximize,
  LuPhone,
  LuMail,
  LuCircleAlert,
  LuHouse,
  LuBox,
  LuChevronLeft,
  LuChevronRight,
  LuFilter,
  LuX,
} from "react-icons/lu";
import apiClient, { baseURL } from "../../api/Client";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { currencyFormatter } from "../../../helpers";
import { BsHouse } from "react-icons/bs";
import houseImage from '../../assets/images/shop3.svg';

const SpaceRentals = () => {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Server-side pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 25,
    total: 0,
    from: 0,
    to: 0,
  });
  const [locations, setLocations] = useState([]);

  const hasFetchedData = useRef(false);
  const searchTimeout = useRef(null);
  const navigate = useNavigate();

  const storedUserInfo = localStorage.getItem("userInfo");
  const parsedUserInfo = JSON.parse(storedUserInfo);
  const customer = parsedUserInfo?.customer;

  // Default placeholder image for properties without images
  const DEFAULT_HOUSE_IMAGE = houseImage;

  useEffect(() => {
    loadData();
    loadLocations();
  }, [pagination.currentPage, pagination.perPage]);

  // Debounced search effect
  useEffect(() => {
    if (hasFetchedData.current) {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      searchTimeout.current = setTimeout(() => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        loadData(1);
      }, 500);
    }
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  // Location filter effect
  useEffect(() => {
    if (hasFetchedData.current) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      loadData(1);
    }
  }, [locationFilter]);

  const loadLocations = async () => {
    try {
      const response = await apiClient.get("/settings/unit-location");
      if (response.ok) {
        const locationData = response?.data?.data?.data || response?.data?.data || [];
        setLocations(Array.isArray(locationData) ? locationData : []);
      }
    } catch (error) {
      console.error("Failed to load locations:", error);
    }
  };

  const loadData = async (page = pagination.currentPage) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {
        real_estate_type: "business land",
        page: page,
        limit: pagination.perPage,
      };

      // Add search parameter if exists
      if (searchTerm.trim()) {
        params.name = searchTerm.trim();
      }

      // Add location filter if exists
      if (locationFilter) {
        params.Unit_Location_ID = locationFilter;
      }

      const response = await apiClient.get("/settings/real-estate", params);

      if (
        !response.ok ||
        response?.data?.error ||
        response?.data?.code >= 400
      ) {
        setLoading(false);
        toast.error(response?.data?.error || "Failed to fetch space units");
        return;
      }

      const responseData = response?.data?.data;
      
      // Handle Laravel pagination response
      const userData = responseData?.data || responseData;
      const newData = userData?.map((house, index) => ({
        ...house,
        key: house.id,
      }));

      setHouses(Array.isArray(newData) ? newData : []);
      
      // Update pagination info
      setPagination({
        currentPage: responseData?.current_page || 1,
        lastPage: responseData?.last_page || 1,
        perPage: responseData?.per_page || pagination.perPage,
        total: responseData?.total || 0,
        from: responseData?.from || 0,
        to: responseData?.to || 0,
      });
      
      setLoading(false);
      hasFetchedData.current = true;
    } catch (error) {
      console.error("Fetch units error:", error);
      setLoading(false);
      toast.error("Failed to load space units");
    }
  };

  // Get house image with fallback to default
  const getHouseImage = (house, imageIndex = 0) => {
    // Check if house has images
    if (house?.image && Array.isArray(house.image) && house.image.length > 0) {
      const imagePath = house.image[imageIndex]?.image_path;
      if (imagePath) {
        return `${baseURL}/${imagePath}`;
      }
    }
    // Return default placeholder if no image
    return DEFAULT_HOUSE_IMAGE;
  };

  // Get all images for a house
  const getHouseImages = (house) => {
    if (house?.image && Array.isArray(house.image) && house.image.length > 0) {
      return house.image.map((img) => `${baseURL}/${img?.image_path}`);
    }
    return [DEFAULT_HOUSE_IMAGE];
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleHouseClick = async (house) => {
    if (house?.available === "no") {
      return null;
    }

    setSelectedHouse(house);
    setCurrentImageIndex(0);
    setLoadingFeatures(false);
  };

  const handleNextImage = (house) => {
    const images = getHouseImages(house);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (house) => {
    const images = getHouseImages(house);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pagination.lastPage) {
      setPagination(prev => ({ ...prev, currentPage: pageNumber }));
      loadData(pageNumber);
      // Scroll to top of the grid
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePerPageChange = (e) => {
    const newPerPage = Number(e.target.value);
    setPagination(prev => ({ ...prev, perPage: newPerPage, currentPage: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const { currentPage, lastPage } = pagination;

    if (lastPage <= maxVisiblePages) {
      for (let i = 1; i <= lastPage; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(lastPage);
      } else if (currentPage >= lastPage - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = lastPage - 3; i <= lastPage; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(lastPage);
      }
    }

    return pageNumbers;
  };

  const getFeatureIcon = (description) => {
    if (!description) return <LuBox className="w-5 h-5" />;
    const normalizedDesc = description.toLowerCase();

    if (normalizedDesc.includes("bedroom"))
      return <LuBed className="w-5 h-5" />;
    if (normalizedDesc.includes("bathroom") || normalizedDesc.includes("bath"))
      return <LuBath className="w-5 h-5" />;
    if (normalizedDesc.includes("parking") || normalizedDesc.includes("garage"))
      return <LuCar className="w-5 h-5" />;
    if (normalizedDesc.includes("square") || normalizedDesc.includes("meter"))
      return <LuMaximize className="w-5 h-5" />;
    if (normalizedDesc.includes("washroom"))
      return <LuBath className="w-5 h-5" />;
    if (normalizedDesc.includes("table"))
      return <LuBox className="w-5 h-5" />;
    return <LuBox className="w-5 h-5" />;
  };

  const getFeatureDisplayInfo = (feature) => {
    const normalizedDesc = feature?.feature?.description?.toLowerCase() || "";

    if (normalizedDesc.includes("bedroom")) {
      return {
        icon: <LuBed className="w-5 h-5 text-gray-600" />,
        label: "Bedrooms",
        value: feature?.quantity || "N/A",
      };
    } else if (
      normalizedDesc.includes("bathroom") ||
      normalizedDesc.includes("bath")
    ) {
      return {
        icon: <LuBath className="w-5 h-5 text-gray-600" />,
        label: "Bathrooms",
        value: feature?.quantity || "N/A",
      };
    } else if (normalizedDesc.includes("washroom")) {
      return {
        icon: <LuBath className="w-5 h-5 text-gray-600" />,
        label: "Washrooms",
        value: feature?.quantity || "N/A",
      };
    } else if (normalizedDesc.includes("parking")) {
      return {
        icon: <LuCar className="w-5 h-5 text-gray-600" />,
        label: "Parking Spaces",
        value: feature?.quantity || "N/A",
      };
    } else if (
      normalizedDesc.includes("square") ||
      normalizedDesc.includes("meter")
    ) {
      return {
        icon: <LuMaximize className="w-5 h-5 text-gray-600" />,
        label: "Area (sq m)",
        value: feature?.quantity ? feature.quantity.toLocaleString() : "N/A",
      };
    } else if (normalizedDesc.includes("table")) {
      return {
        icon: <LuBox className="w-5 h-5 text-gray-600" />,
        label: "Tables",
        value: feature?.quantity || "N/A",
      };
    } else {
      return {
        icon: <LuBox className="w-5 h-5 text-gray-600" />,
        label: feature?.feature?.description || "Feature",
        value: feature?.quantity || "N/A",
      };
    }
  };

  const hasActiveFilters = searchTerm || locationFilter;

  if (loading && !hasFetchedData.current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
            <div className="flex items-start">
              <LuCircleAlert className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Please note: Submitting a request for an available rental space does
                not guarantee approval. All requests are subject to review and
                final approval by management.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-blue-600">Space Rentals</h1>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LuX className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  showFilters 
                    ? "bg-blue-600 text-white" 
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                <LuFilter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="space-y-3">
            <div className="relative">
              <LuSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Expandable Location Filter */}
            {showFilters && (
              <div className="relative">
                <LuMapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location.Unit_Location_ID} value={location.Unit_Location_ID}>
                      {location.Unit_Location}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Available Properties
          </h2>
          <p className="text-gray-600">
            {pagination.total} properties available
            {hasActiveFilters && " (filtered)"}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Property Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses?.map((house) => {
              const isUnavailable = house?.available === "no";

              return (
                <div
                  key={house.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition ${
                    isUnavailable
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-xl cursor-pointer"
                  }`}
                  onClick={() => handleHouseClick(house)}
                >
                  <div className="relative h-56 overflow-hidden bg-gray-200">
                    <img
                      src={getHouseImage(house, 0)}
                      alt={house.name}
                      className={`w-full h-full ${house?.image && house?.image?.length > 0 ? "object-cover" : "object-contain p-4"} transition duration-300 ${
                        !isUnavailable && "hover:scale-110"
                      }`}
                      onError={(e) => {
                        e.target.src = DEFAULT_HOUSE_IMAGE;
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(house?.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 transition"
                    >
                      <LuHeart
                        className={`w-5 h-5 ${
                          favorites.includes(house?.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {currencyFormatter.format(house?.price)}
                    </div>
                    {house?.status === "active" && (
                      <>
                        {isUnavailable ? (
                          <div className="absolute top-3 left-3 bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Not Available
                          </div>
                        ) : (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Available
                          </div>
                        )}
                      </>
                    )}
                    {house?.image?.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                        {house?.image?.length} photos
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {house?.name}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-3">
                      <LuMapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-sm">
                        {house?.location
                          ? house?.location?.Unit_Location
                          : house?.description}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-gray-600 capitalize bg-gray-100 px-3 py-1 rounded-full">
                        {house?.real_estate_type}
                      </span>
                      {!isUnavailable && (
                        <button className="cursor-pointer text-blue-600 text-sm font-semibold hover:text-blue-700">
                          View Details →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && houses?.length === 0 && (
          <div className="text-center py-12">
            <BsHouse className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No rental spaces found matching your search criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && houses?.length > 0 && pagination.lastPage > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={pagination.perPage}
                  onChange={handlePerPageChange}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                Showing {pagination.from} to {pagination.to} of {pagination.total} properties
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`p-2 rounded-lg ${
                    pagination.currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <LuChevronLeft className="w-5 h-5" />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((pageNum, index) => (
                  <React.Fragment key={index}>
                    {pageNum === '...' ? (
                      <span className="px-2 py-1 text-gray-400">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                          pagination.currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className={`p-2 rounded-lg ${
                    pagination.currentPage === pagination.lastPage
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <LuChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Space Manager Contact */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Need Assistance?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact our space manager for inquiries, viewing appointments, or
            additional information about available rental spaces.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="bg-blue-600 p-3 rounded-full">
                <LuPhone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                <a
                  href="tel:+255123456789"
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                >
                  +255 747 543 726
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="bg-blue-600 p-3 rounded-full">
                <LuMail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email Address</p>
                <a
                  href="mailto:housemanager@example.com"
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700 break-all"
                >
                  emanuel.magogo@kcmc.ac.tz
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedHouse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedHouse(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80">
              <img
                src={getHouseImages(selectedHouse)[currentImageIndex]}
                alt={selectedHouse?.name}
                className={`w-full h-full ${selectedHouse?.image && selectedHouse?.image?.length > 0 ? "object-cover" : "object-contain p-4"}`}
                onError={(e) => {
                  e.target.src = DEFAULT_HOUSE_IMAGE;
                }}
              />

              {/* Image navigation */}
              {getHouseImages(selectedHouse).length > 1 && (
                <>
                  <button
                    onClick={() => handlePrevImage(selectedHouse)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 shadow-lg"
                  >
                    <LuChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={() => handleNextImage(selectedHouse)}
                    className="absolute right-16 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 shadow-lg"
                  >
                    <LuChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} /{" "}
                    {getHouseImages(selectedHouse).length}
                  </div>
                </>
              )}

              <button
                onClick={() => setSelectedHouse(null)}
                className="absolute h-10 w-10 top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedHouse?.name}
                  </h2>
                  <div className="flex items-center text-gray-600">
                    <LuMapPin className="w-5 h-5 mr-1" />
                    <span>{selectedHouse?.location
                        ? selectedHouse?.location?.Unit_Location
                        : selectedHouse?.description}</span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full capitalize">
                      {selectedHouse?.real_estate_type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {currencyFormatter.format(selectedHouse?.price)}
                  </div>
                  <div className="text-sm text-gray-600">Price/Month</div>
                </div>
              </div>

              {selectedHouse?.feature && selectedHouse?.feature?.length > 0 ? (
                <>
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="text-xl font-bold mb-4">
                      Property Features
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedHouse?.feature?.map((feature) => {
                        const displayInfo = getFeatureDisplayInfo(feature);
                        return (
                          <div
                            key={feature?.id}
                            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
                          >
                            {displayInfo?.icon}
                            <div className="text-lg font-semibold text-gray-800 mt-2">
                              {displayInfo?.value}
                            </div>
                            <div className="text-sm text-gray-600 text-center">
                              {displayInfo?.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3">
                      Available Amenities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHouse?.feature?.map((feature) => (
                        <span
                          key={feature.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm"
                        >
                          {getFeatureIcon(feature?.feature?.description)}
                          <span>
                            {feature?.feature?.description}
                            {feature?.quantity &&
                              `: ${feature?.quantity?.toLocaleString()}`}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-6 py-8 text-center border-y">
                  <p className="text-gray-500">
                    No features information available for this property.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/space-units/${selectedHouse?.id}/request-letter`)
                  }
                  className="flex-1 cursor-pointer bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Request Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceRentals;