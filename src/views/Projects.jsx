import { useState } from "react";
import { GiFarmTractor, GiMedicines } from "react-icons/gi";
import { BiBuildingHouse } from "react-icons/bi";
import { BsHouses } from "react-icons/bs";
import { MdOutlinePropaneTank } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Projects = () => {
  const [selectedModule, setSelectedModule] = useState("overview");

  const navigate = useNavigate();

  // Sample data
  const businessData = {
    hostels: {
      totalBuildings: 12,
      totalRooms: 450,
      occupiedRooms: 385,
      students: 385,
      revenue: 45500000,
    },
    houseRenting: {
      totalProperties: 35,
      totalUnits: 150,
      occupiedUnits: 132,
      tenants: 132,
      revenue: 125750000,
    },
    farmPlots: {
      totalPlots: 85,
      occupiedPlots: 72,
      owners: 72,
      revenue: 32400000,
      activeContracts: 68,
    },
    oxygen: {
      productionCapacity: "500 Cylinders/Day",
      inventory: 1250,
      clients: 45,
      revenue: 18900000,
      pendingOrders: 12,
    },
    spaceRenting: {
      totalSpaces: 25,
      bookedSpaces: 18,
      customers: 52,
      revenue: 15600000,
      upcomingBookings: 14,
    },
  };

  const formatter = new Intl.NumberFormat("en-US");

  const totalRevenue =
    businessData.hostels.revenue +
    businessData.houseRenting.revenue +
    businessData.farmPlots.revenue +
    businessData.oxygen.revenue +
    businessData.spaceRenting.revenue;

  const totalCustomers =
    businessData.hostels.students +
    businessData.houseRenting.tenants +
    businessData.farmPlots.owners +
    businessData.oxygen.clients +
    businessData.spaceRenting.customers;

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
            <h3 className="text-white text-xl font-semibold">3</h3>
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
            <h3 className="text-gray-400 text-xl font-semibold">
              {businessData.houseRenting.totalProperties}
            </h3>
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
              NURU FARM
            </h4>
            <GiFarmTractor className="w-7 h-7 text-gray-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-gray-400 text-xl font-semibold">1</h3>
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
