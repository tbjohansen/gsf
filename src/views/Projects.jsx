import { useEffect, useRef, useState } from "react";
import { GiFarmTractor, GiMedicines } from "react-icons/gi";
import { BiBuildingHouse } from "react-icons/bi";
import { BsHouses } from "react-icons/bs";
import { MdOutlinePropaneTank } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../api/Client";

const Projects = () => {
  const [selectedModule, setSelectedModule] = useState("overview");
  const [hostels, setHostels] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [plants, setPlants] = useState([]);
  const [farm, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadHostelData();
      loadRentalsData();
    }
  }, []);

  const loadHostelData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/hostel");

      if (!response.ok) {
        setLoading(false);
        // toast.error("Failed to fetch hostels");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        // toast.error("Failed to fetch hostels");
        return;
      }

      // Adjust based on your API response structure
      const hostelData = response?.data?.data;
      const newData = hostelData?.map((hostel, index) => ({
        ...hostel,
        key: index + 1,
      }));
      // console.log(newData);
      setHostels(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch hostels error:", error);
      setLoading(false);
      // toast.error("Failed to load hostels");
    }
  };

  const loadRentalsData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/real-estate");

      if (!response.ok) {
        setLoading(false);
        // toast.error(response.data?.error || "Failed to fetch units");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        // toast.error(response.data.error || "Failed to fetch units");
        return;
      }

      const userData = response?.data?.data?.data;
      const newData = userData?.map((user, index) => ({
        ...user,
        key: index + 1,
      }));
      setRentals(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch units error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white-900 p-6">
      <div className="mb-6">
        <p className="text-gray-600">The list of all projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className="rounded-lg p-4 bg-[rgb(22,40,79)] cursor-pointer shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          // style={{
          //   background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          // }}
          onClick={() => navigate("/projects/hostels")}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              HOSTELS
            </h4>
            <BiBuildingHouse className="w-7 h-7 text-gray-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-xl font-semibold">{hostels?.length}</h3>
          </div>
        </div>

        <div
          className="rounded-lg p-4 bg-[rgb(22,40,79)] cursor-pointer shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          onClick={() => navigate("/projects/oxygen")}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              OXYGEN & NITROGEN PLANT
            </h4>
            <MdOutlinePropaneTank className="w-7 h-7 text-gray-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-xl font-semibold">1</h3>
          </div>
        </div>

        <div
          className="rounded-lg p-4 bg-[rgb(22,40,79)] cursor-pointer shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          onClick={() => navigate("/projects/real-estates")}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              RENTAL UNITS & SPACES
            </h4>
            <BsHouses className="w-7 h-7 text-gray-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-xl font-semibold">
              {rentals?.length}
            </h3>
          </div>
        </div>

        <div
          className="rounded-lg p-4 bg-[rgb(22,40,79)] cursor-pointer shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          onClick={() => navigate("/projects/farms")}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              FARMS
            </h4>
            <GiFarmTractor className="w-7 h-7 text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-xl font-semibold">1</h3>
          </div>
        </div>

        <div
          onClick={() =>
            toast("Sorry! This feature is under maintenance", { icon: "ℹ️" })
          }
          className="rounded-lg p-4 bg-gray-300 cursor-not-allowed shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-black text-xs font-light opacity-90">
              GSF PHARMACY
            </h4>
            <GiMedicines className="w-7 h-7 text-gray-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-gray-400 text-xl font-semibold">1</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
