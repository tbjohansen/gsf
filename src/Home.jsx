import { useState } from "react";
import { LuTruck, LuCable, LuTrendingUp, LuUsers } from "react-icons/lu";

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to Your Dashboard
        </h2>
        <p className="text-gray-600 mb-4">
          Click the chevron button in the sidebar to toggle between full and
          icon-only views!
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
          {/* <LuChevronLeft className="w-4 h-4" /> */}
          <span>Use the toggle button to collapse/expand the sidebar</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Trucks</h3>
            <LuTruck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">24</p>
          <p className="text-xs text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Trips</h3>
            <LuCable className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">18</p>
          <p className="text-xs text-green-600 mt-2">+8% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <LuTrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">$45,231</p>
          <p className="text-xs text-green-600 mt-2">+23% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <LuUsers className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">156</p>
          <p className="text-xs text-green-600 mt-2">+5% from last month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 pb-4 border-b last:border-b-0"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <LuTruck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  Trip #{1000 + item} completed
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Completed
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
