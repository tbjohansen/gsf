
import { MdPeople, MdTrendingUp } from "react-icons/md";
import { BiSolidBuildings } from "react-icons/bi";
import { FaHome } from "react-icons/fa";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Welcome to GSF Projects Dashboard
          </h2>
          <p className="opacity-90 mb-4">
            Managing student hostels and employee housing solutions
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm">
              <span>🎓 Student Hostels</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm">
              <span>💼 Renting Houses</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Student Hostels</h3>
              <BiSolidBuildings className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">28</p>
            <p className="text-xs text-blue-600 mt-2">320 student beds available</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Employee Houses</h3>
              <FaHome className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">19</p>
            <p className="text-xs text-sky-600 mt-2">62 professionals housed</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Monthly Revenue</h3>
              <MdTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">TZS 12.5M</p>
            <p className="text-xs text-green-600 mt-2">+18% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Occupants</h3>
              <MdPeople className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">382</p>
            <p className="text-xs text-purple-600 mt-2">92% occupancy rate</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Recent Payments & Updates
          </h3>
          <div className="space-y-4">
            {[
              { id: 1, type: "Booking", property: "Hostel Room 205", time: "1 hour ago", status: "Confirmed" },
              { id: 2, type: "Payment", property: "House - Kinondoni", time: "3 hours ago", status: "Received" },
              { id: 3, type: "Check-out", property: "Apartment B12", time: "5 hours ago", status: "Completed" },
              { id: 4, type: "Booking", property: "Studio - Msasani", time: "1 day ago", status: "Pending" }
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 pb-4 border-b last:border-b-0"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaHome className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {item.type} - {item.property}
                  </p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  item.status === "Completed" || item.status === "Confirmed" || item.status === "Received"
                    ? "text-green-600 bg-green-50"
                    : "text-yellow-600 bg-yellow-50"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;