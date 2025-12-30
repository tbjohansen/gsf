import React, { useEffect, useState } from "react";
import {
  LuSearch,
  LuMapPin,
  LuBed,
  LuBath,
  LuSquare,
  LuHeart,
  LuStar,
  LuWifi,
  LuCar,
  LuWind,
  LuWaves,
  LuHouse,
  LuMaximize,
} from "react-icons/lu";
import { toast } from "react-hot-toast";
import apiClient from "../../api/Client";
import { currencyFormatter } from "../../../helpers";

const HouseRentals = () => {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedHouseFeatures, setSelectedHouseFeatures] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch houses on component mount
  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        "/settings/real-estate?&real_estate_type=house"
      );

      if (!response.ok) {
        setLoading(false);
        setError("Failed to fetch units");
        toast.error(response.data?.error || "Failed to fetch units");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        setError(response.data.error || "Failed to fetch units");
        toast.error(response.data.error || "Failed to fetch units");
        return;
      }

      const userData = response?.data?.data?.data || [];

      const houseArray = [];

      userData.forEach((house, index) => {
        if (house?.real_estate_type === "house") {
          houseArray.push(house);
        }
      });

      // Adjust based on your API response structure
      if (houseArray?.length > 0) {
        const newData = houseArray?.map((house, index) => ({
          ...house,
          key: index + 1,
        }));
        // console.log(newData);
        setHouses(Array.isArray(newData) ? newData : []);
      }

      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Fetch units error:", error);
      setError("Failed to load units");
      setLoading(false);
      toast.error("Failed to load units");
    }
  };

  // Fetch features for a specific house
  const fetchHouseFeatures = async (houseId) => {
    try {
      setLoadingFeatures(true);
      const response = await apiClient.get(
        "/settings/real-estate-assigned-feature",
        {
          real_estate_id: houseId,
        }
      );

      if (!response.ok) {
        setLoadingFeatures(false);
        toast.error(response.data?.error || "Failed to fetch house features");
        return;
      }

      if (response?.data?.error || response.data?.code >= 400) {
        setLoadingFeatures(false);
        toast.error(response.data.error || "Failed to fetch house features");
        return;
      }

      const featuresData = response?.data?.data;
      const newData = featuresData?.map((feature, index) => ({
        ...feature,
        key: index + 1,
      }));
      setSelectedHouseFeatures(Array.isArray(newData) ? newData : []);
      setLoadingFeatures(false);
    } catch (error) {
      console.error("Fetch house features error:", error);
      setLoadingFeatures(false);
      toast.error("Failed to load house features");
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleHouseClick = async (house) => {
    setSelectedHouse(house);
    setSelectedHouseFeatures([]);
    setShowContactModal(false);
    setShowRequestModal(false);
    setSelectedFile(null);
    await fetchHouseFeatures(house.id);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast.error("Please select a PDF or Word document");
      }
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedFile) {
      toast.error("Please attach a request letter");
      return;
    }

    // Here you would typically upload the file to your API
    // For now, we'll just show a success message
    toast.success("Request submitted successfully!");
    setShowRequestModal(false);
    setSelectedFile(null);

    // You can add your API call here:
    // const formData = new FormData();
    // formData.append('request_letter', selectedFile);
    // formData.append('real_estate_id', selectedHouse.id);
    // await apiClient.post('/submit-request', formData);
  };

  const filteredHouses = houses.filter(
    (house) =>
      house.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate placeholder image based on house ID
  const getHouseImage = (id) => {
    const images = [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
    ];
    return images[(id - 1) % images.length];
  };

  // Map feature descriptions to icons
  const getFeatureIcon = (description) => {
    if (!description) return <LuHouse className="w-5 h-5" />;

    const normalizedDesc = description.toLowerCase();

    if (normalizedDesc.includes("bedroom")) {
      return <LuBed className="w-5 h-5" />;
    } else if (
      normalizedDesc.includes("bathroom") ||
      normalizedDesc.includes("bath")
    ) {
      return <LuBath className="w-5 h-5" />;
    } else if (
      normalizedDesc.includes("parking") ||
      normalizedDesc.includes("garage")
    ) {
      return <LuCar className="w-5 h-5" />;
    } else if (
      normalizedDesc.includes("square") ||
      normalizedDesc.includes("meter") ||
      normalizedDesc.includes("sqft")
    ) {
      return <LuMaximize className="w-5 h-5" />;
    } else if (
      normalizedDesc.includes("wifi") ||
      normalizedDesc.includes("internet")
    ) {
      return <LuWifi className="w-5 h-5" />;
    } else if (normalizedDesc.includes("pool")) {
      return <LuWaves className="w-5 h-5" />;
    } else if (
      normalizedDesc.includes("ac") ||
      normalizedDesc.includes("air")
    ) {
      return <LuWind className="w-5 h-5" />;
    } else {
      return <LuHouse className="w-5 h-5" />;
    }
  };

  // Get display info for features
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
        icon: <LuHouse className="w-5 h-5 text-gray-600" />,
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-blue-600">House Rentals</h1>
            {error && (
              <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                {error}
              </span>
            )}
          </div>

          {/* Search Bar */}
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
            {filteredHouses.length} properties available
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHouses.map((house) => (
            <div
              key={house.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
              onClick={() => handleHouseClick(house)}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={getHouseImage(house.id)}
                  alt={house.name}
                  className="w-full h-full object-cover hover:scale-110 transition duration-300"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(house.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 transition"
                >
                  <LuHeart
                    className={`w-5 h-5 ${
                      favorites.includes(house.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
                <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {currencyFormatter.format(house?.price)}
                </div>
                {house.status === "active" && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Available
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {house.name}
                </h3>

                <div className="flex items-center text-gray-600 mb-3">
                  <LuMapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">{house.description}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-gray-600 capitalize bg-gray-100 px-3 py-1 rounded-full">
                    {house.real_estate_type}
                  </span>
                  <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHouses.length === 0 && (
          <div className="text-center py-12">
            <LuHouse className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No properties found matching your search.
            </p>
          </div>
        )}
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
                src={getHouseImage(selectedHouse.id)}
                alt={selectedHouse.name}
                className="w-full h-full object-cover"
              />
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
                    {selectedHouse.name}
                  </h2>
                  <div className="flex items-center text-gray-600">
                    <LuMapPin className="w-5 h-5 mr-1" />
                    <span>{selectedHouse.description}</span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full capitalize">
                      {selectedHouse.real_estate_type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {currencyFormatter.format(selectedHouse.price)}
                  </div>
                  <div className="text-sm text-gray-600">Price/Month</div>
                </div>
              </div>

              {loadingFeatures ? (
                <div className="py-8 text-center border-y mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">
                    Loading property features...
                  </p>
                </div>
              ) : selectedHouseFeatures.length > 0 ? (
                <>
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="text-xl font-bold mb-4">
                      Property Features
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedHouseFeatures.map((feature) => {
                        const displayInfo = getFeatureDisplayInfo(feature);
                        return (
                          <div
                            key={feature.id}
                            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
                          >
                            {displayInfo.icon}
                            <div className="text-lg font-semibold text-gray-800 mt-2">
                              {displayInfo.value}
                            </div>
                            <div className="text-sm text-gray-600 text-center">
                              {displayInfo.label}
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
                      {selectedHouseFeatures.map((feature) => (
                        <span
                          key={feature.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm"
                        >
                          {getFeatureIcon(feature?.feature?.description)}
                          <span>
                            {feature?.feature?.description}
                            {feature?.quantity &&
                              `: ${feature.quantity.toLocaleString()}`}
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
                  onClick={() => setShowRequestModal(true)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Request Now
                </button>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Contact House Manager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Manager Modal */}
      {showContactModal && selectedHouse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Contact House Manager
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedHouse?.employee?.name?.charAt(0).toUpperCase() ||
                      "A"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {selectedHouse?.employee?.name || "Admin"}
                    </h4>
                    <p className="text-sm text-gray-600">Property Manager</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${selectedHouse?.employee?.email}`}
                      className="hover:text-blue-600"
                    >
                      {selectedHouse?.employee?.email || "N/A"}
                    </a>
                  </div>

                  {selectedHouse?.employee?.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <a
                        href={`tel:${selectedHouse?.employee?.phone}`}
                        className="hover:text-blue-600"
                      >
                        {selectedHouse?.employee?.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Property Details
                </h5>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{selectedHouse.name}</span> -{" "}
                  {selectedHouse.description}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Price Per Month:{" "}
                  <span className="font-semibold text-blue-600">
                    {currencyFormatter.format(selectedHouse.price)}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowContactModal(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedHouse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowRequestModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Submit Request
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-2">
                  {selectedHouse.name}
                </h5>
                <p className="text-sm text-gray-600">
                  {selectedHouse.description}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Price Per Month:{" "}
                  <span className="font-semibold text-blue-600">
                    {currencyFormatter.format(selectedHouse.price)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Request Letter <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {selectedFile ? (
                        <span className="text-blue-600 font-medium">
                          {selectedFile.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-blue-600 font-medium">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, or DOCX (MAX. 10MB)
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedFile(null);
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={!selectedFile}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    selectedFile
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseRentals;
