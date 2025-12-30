import { useState } from "react";
import { LuActivity, LuLeaf, LuTrendingUp } from "react-icons/lu";
import { PiFarmLight } from "react-icons/pi";
import { GiFarmTractor, GiMoneyStack } from "react-icons/gi";
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
      productionCapacity: "500 units",
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
        <p className="text-gray-600">The overview of all project operations</p>
      </div>

      {/* Business Modules Section */}
      <div className="mb-6">
        {/* <h2 className="text-2xl font-bold text-black mb-4">Projects</h2> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hostels */}
          <div
            onClick={() => setSelectedModule("hostels")}
            className="bg-white rounded-lg p-5 border-white shadow-xl hover:border-gray-100 transition-all duration-300 cursor-pointer hover:shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-indigo-600">
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
              <div className="p-3 rounded-lg bg-purple-600">
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
              <h3 className="text-black text-lg font-semibold">Oxygen & Nitrogen Plant</h3>
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
                  {businessData.oxygen.inventory} items
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

          {/* Nuru Farm */}
          <div
            onClick={() => setSelectedModule("spaceRenting")}
            className="bg-white rounded-lg p-5 border border-white shadow-xl hover:border-gray-100 transition-all duration-300 cursor-pointer hover:shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-sky-900">
                <PiFarmLight className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-black text-lg font-semibold">Nuru Farm</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Sheeps</span>
                <span className="text-black font-medium">
                  {businessData.spaceRenting.totalSpaces}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Investor</span>
                <span className="text-black font-medium">
                  {1}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fruits</span>
                <span className="text-black font-medium">
                  {businessData.spaceRenting.customers}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Supplied (kgs)</span>
                <span className="text-black font-medium">{70}</span>
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
