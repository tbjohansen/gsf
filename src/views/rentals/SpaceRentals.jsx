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
} from "react-icons/lu";
import apiClient, { baseURL } from "../../api/Client";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { currencyFormatter } from "../../../helpers";
import { BsHouse } from "react-icons/bs";

const SpaceRentals = () => {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasFetchedData = useRef(false);
  const navigate = useNavigate();

  // Default placeholder image for properties without images
  const DEFAULT_HOUSE_IMAGE =
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop";

  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/real-estate", {
        real_estate_type: "business land",
      });

      if (
        !response.ok ||
        response?.data?.error ||
        response?.data?.code >= 400
      ) {
        setLoading(false);
        toast.error(response?.data?.error || "Failed to fetch space units");
        return;
      }

      const userData = response?.data?.data?.data;
      const newData = userData?.map((house, index) => ({
        ...house,
        key: index + 1,
        // Process features to include descriptions
        feature:
          house.feature?.map((f) => ({
            ...f,
            // feature: {
            //   description: getFeatureDescription(f.real_estate_feature_id),
            // },
          })) || [],
      }));

      setHouses(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch units error:", error);
      setLoading(false);
      toast.error("Failed to load space units");
    }
  };

  // Map feature IDs to descriptions (adjust based on your API)
  const getFeatureDescription = (featureId) => {
    const featureMap = {
      1: "Bedrooms",
      2: "Square meters",
      3: "Parking spaces",
      4: "Bathrooms",
    };
    return featureMap[featureId] || "Feature";
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

  // const currencyFormatter = new Intl.NumberFormat("en-TZ", {
  //   style: "currency",
  //   currency: "TZS",
  //   minimumFractionDigits: 0,
  // });

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

  const filteredHouses = houses.filter(
    (house) =>
      house?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    } else {
      return {
        icon: <LuBox className="w-5 h-5 text-gray-600" />,
        label: feature?.feature?.description || "Feature",
        value: feature?.quantity || "N/A",
      };
    }
  };

  if (loading) {
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
          </div>

          <div className="relative">
            <LuSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            {filteredHouses?.length} properties available
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHouses?.map((house) => {
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
                    className={`w-full h-full object-cover transition duration-300 ${
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

        {filteredHouses?.length === 0 && (
          <div className="text-center py-12">
            <BsHouse className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No properties found matching your search.
            </p>
          </div>
        )}

        {/* House Manager Contact */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Need Assistance?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact our house manager for inquiries, viewing appointments, or
            additional information about available properties.
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
                  +255 123 456 789
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
                  housemanager@example.com
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
                className="w-full h-full object-cover"
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
                    <LuCircleAlert className="w-6 h-6 text-gray-800 rotate-90" />
                  </button>
                  <button
                    onClick={() => handleNextImage(selectedHouse)}
                    className="absolute right-16 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 shadow-lg"
                  >
                    <LuCircleAlert className="w-6 h-6 text-gray-800 -rotate-90" />
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
