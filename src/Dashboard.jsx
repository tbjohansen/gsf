import { useState } from "react";
import {
  LuActivity,
  LuBuilding,
  LuCalendar,
  LuDollarSign,
  LuHouse,
  LuLeaf,
  LuTreePine,
  LuTrendingUp,
  LuUser,
  LuWarehouse,
} from "react-icons/lu";
import { GiFarmTractor, GiMoneyStack  } from "react-icons/gi";
import { LuLandPlot } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import { BiBuildingHouse } from "react-icons/bi";
import { BsHouses } from "react-icons/bs";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState("overview");

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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">
          GSF Projects Dashboard
        </h1>
        <p className="text-gray-600">Overview of all projects operations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1 - Hostels */}
        <div
          className="rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              Total Hostels
            </h4>
            <BiBuildingHouse className="w-7 h-7 text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-2xl font-semibold">
              {businessData.hostels.totalBuildings}
            </h3>
          </div>
        </div>

        {/* Card 2 - Properties */}
        <div
          className="rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          }}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              Rental Units
            </h4>
            <BsHouses className="w-7 h-7 text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-2xl font-semibold">
              {businessData.houseRenting.totalProperties}
            </h3>
          </div>
        </div>

        {/* Card 3 - Farm Plots */}
        <div
          className="rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          }}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              Farm Plots
            </h4>
            <GiFarmTractor className="w-7 h-7 text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-2xl font-semibold">
              {businessData.farmPlots.totalPlots}
            </h3>
          </div>
        </div>

        {/* Card 4 - Oxygen */}
        <div
          className="rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          }}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              Oxygen Inventory
            </h4>
            <LuLeaf className="w-7 h-7 text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-2xl font-semibold">
              {businessData.oxygen.inventory} <span className="text-lg">Cylinders</span>
            </h3>
          </div>
        </div>

        {/* Card 5 - Spaces */}
        <div
          className="rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          }}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              Available Spaces
            </h4>
            <LuLandPlot className="w-7 h-7 text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-2xl font-semibold">
              {businessData.spaceRenting.totalSpaces}
            </h3>
          </div>
        </div>

        {/* Card 6 - Customers */}
        <div
          className="rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
          }}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              Total Customers
            </h4>
            <GoPeople className="w-7 h-7 text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-2xl font-semibold">
              {totalCustomers}
            </h3>
          </div>
        </div>

        {/* Card 7 - Hostels Revenue */}
        <div
          className="rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
          }}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              Hostels Revenue
            </h4>
            <GiMoneyStack className="w-7 h-7 text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-xl font-semibold">
              TZS {formatter.format(businessData.hostels.revenue)}
            </h3>
          </div>
        </div>

        {/* Card 8 - Total Revenue */}
        <div
          className="rounded-lg p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
          }}
        >
          <div className="flex flex-row justify-between items-start mb-2">
            <h4 className="text-white text-xs font-light opacity-90">
              Total Revenue
            </h4>
            <LuTrendingUp className="w-7 h-7 text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-white text-xl font-semibold">
              TZS {formatter.format(totalRevenue)}
            </h3>
          </div>
        </div>
      </div>

      {/* Business Modules Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-4">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hostels */}
          <div
            onClick={() => setSelectedModule("hostels")}
            className="bg-white rounded-lg p-5 border-white shadow-xl hover:border-gray-100 transition-all duration-300 cursor-pointer hover:shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-purple-600">
                <BiBuildingHouse className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black text-lg font-semibold">
                Hostels Management
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Buildings</span>
                <span className="text-black font-medium">
                  {businessData.hostels.totalBuildings}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Rooms</span>
                <span className="text-black font-medium">
                  {businessData.hostels.totalRooms}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Occupied</span>
                <span className="text-black font-medium">
                  {businessData.hostels.occupiedRooms}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Students</span>
                <span className="text-black font-medium">
                  {businessData.hostels.students}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue</span>
                <span className="text-black font-medium">
                  TZS {formatter.format(businessData.hostels.revenue)}
                </span>
              </div>
            </div>
          </div>

          {/* House Renting */}
          <div
            onClick={() => setSelectedModule("houseRenting")}
            className="bg-white rounded-lg p-5 border-white shadow-xl hover:border-gray-100 transition-all duration-300 cursor-pointer hover:shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-pink-600">
                <BsHouses className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black text-lg font-semibold">
                House Units Renting
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Properties</span>
                <span className="text-black font-medium">
                  {businessData.houseRenting.totalProperties}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Units</span>
                <span className="text-black font-medium">
                  {businessData.houseRenting.totalUnits}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Occupied</span>
                <span className="text-black font-medium">
                  {businessData.houseRenting.occupiedUnits}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tenants</span>
                <span className="text-black font-medium">
                  {businessData.houseRenting.tenants}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue</span>
                <span className="text-black font-medium">
                  TZS {formatter.format(businessData.houseRenting.revenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Farm Plots */}
          <div
            onClick={() => setSelectedModule("farmPlots")}
            className="bg-white rounded-lg p-5 border-white shadow-xl hover:border-gray-100 transition-all duration-300 cursor-pointer hover:shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-cyan-600">
                <GiFarmTractor className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black text-lg font-semibold">Farm Plots</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Plots</span>
                <span className="text-black font-medium">
                  {businessData.farmPlots.totalPlots}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Occupied</span>
                <span className="text-black font-medium">
                  {businessData.farmPlots.occupiedPlots}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Owners</span>
                <span className="text-black font-medium">
                  {businessData.farmPlots.owners}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Active Contracts</span>
                <span className="text-black font-medium">
                  {businessData.farmPlots.activeContracts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue</span>
                <span className="text-black font-medium">
                  TZS {formatter.format(businessData.farmPlots.revenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Oxygen Plant */}
          <div
            onClick={() => setSelectedModule("oxygen")}
            className="bg-white rounded-lg p-5 border-white shadow-xl hover:border-gray-100 transition-all duration-300 cursor-pointer hover:shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-green-600">
                <LuLeaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black text-lg font-semibold">Oxygen Plant</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Production</span>
                <span className="text-black font-medium">
                  {businessData.oxygen.productionCapacity}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Inventory</span>
                <span className="text-black font-medium">
                  {businessData.oxygen.inventory} Cylinders
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Clients</span>
                <span className="text-black font-medium">
                  {businessData.oxygen.clients}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pending Orders</span>
                <span className="text-black font-medium">
                  {businessData.oxygen.pendingOrders}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue</span>
                <span className="text-black font-medium">
                  TZS {formatter.format(businessData.oxygen.revenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Space Renting */}
          <div
            onClick={() => setSelectedModule("spaceRenting")}
            className="bg-white rounded-lg p-5 border border-white shadow-xl hover:border-gray-100 transition-all duration-300 cursor-pointer hover:shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-yellow-600">
                <LuLandPlot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black text-lg font-semibold">
                Space Renting
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Spaces</span>
                <span className="text-black font-medium">
                  {businessData.spaceRenting.totalSpaces}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booked</span>
                <span className="text-black font-medium">
                  {businessData.spaceRenting.bookedSpaces}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Customers</span>
                <span className="text-black font-medium">
                  {businessData.spaceRenting.customers}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Upcoming Bookings</span>
                <span className="text-black font-medium">
                  {businessData.spaceRenting.upcomingBookings}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue</span>
                <span className="text-black font-medium">
                  TZS {formatter.format(businessData.spaceRenting.revenue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg p-6 border border-white shadow-lg">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
          <LuActivity className="w-6 h-6 text-blue-400" />
          Recent Activities
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <BiBuildingHouse className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-black text-sm">
                New student booking in Building A, Room 305
              </p>
              <p className="text-gray-400 text-xs mt-1">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <BsHouses className="w-5 h-5 text-pink-400" />
            </div>
            <div className="flex-1">
              <p className="text-black text-sm">
                Maintenance request completed for Property A21
              </p>
              <p className="text-gray-400 text-xs mt-1">3 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <GiFarmTractor className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-black text-sm">
                Cultivation completed for Plot 45
              </p>
              <p className="text-gray-400 text-xs mt-1">5 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <div className="p-2 rounded-lg bg-green-500/10">
              <LuLeaf className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-black text-sm">
                Oxygen delivery completed for Client ABC Hospital
              </p>
              <p className="text-gray-400 text-xs mt-1">6 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <LuLandPlot className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-black text-sm">
                New space booking for mobile money agent
              </p>
              <p className="text-gray-400 text-xs mt-1">8 hours ago</p>
            </div>
          </div>
        </div>
      </div>

     
      
    </div>
  );
};

export default Dashboard;
