import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiShoppingBag,
  FiDollarSign,
  FiAward,
  FiUsers,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import apiClient from "../../api/Client";
import Badge from "../../components/Badge";
import { capitalize, formatter } from "../../../helpers";
import {
  MdOutlineGasMeter,
  MdOutlinePropaneTank,
  MdPeople,
  MdTrendingUp,
} from "react-icons/md";
import { LuContainer } from "react-icons/lu";
import ManagementCard from "../../components/ManagementCard";

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "TZS",
  maximumFractionDigits: 0,
});

const OxygenManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [itemManagement, setItemManagement] = useState([]);
  const [items, setItems] = useState([]);
  const [productions, setProductions] = useState([]);
  const [salesProductions, setSalesProductions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(false);
  React.useEffect(() => {
    loadCustomers();
    loadData();
    loadProductions();
    loadProductionSales();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/settings/item?Item_Type=oxygen`);

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch items");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch items");
        return;
      }

      // Adjust based on your API response structure
      const itemData = response?.data?.data;
      const newData = itemData?.map((item, index) => ({
        id: item.Item_ID,
        name: item.Item_Name,
        price: Number(item?.Item_Price),
        key: index + 1,
        ...item,
      }));
      // console.log(newData);
      setItems(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch items error:", error);
      setLoading(false);
      toast.error("Failed to load items");
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/customer/customer?Customer_Nature=oxygen&limit=10&page=1`
      );
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch customers");
        return;
      }

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch customers");
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data;
      const newData = userData?.map((user, index) => ({
        ...user,
        id: user.Customer_ID,
        name: user.Customer_Name,
        phone: user.Phone_Number,
        status: (
          <Badge
            name={capitalize(user.Customer_Status)}
            color={user.Customer_Status === "active" ? "green" : "error"}
          />
        ),
        orders: user.Email,
      }));
      setCustomers(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch customers error:", error);
      setLoading(false);
      toast.error("Failed to load customers");
    }
  };

  const loadProductions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/oxygen/production`);
      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(
          response.data.error || "Failed to fetch production details"
        );
        return;
      }

      if (!response.ok) {
        setLoading(false);
        toast.error(
          response.data?.error || "Failed to fetch production details"
        );
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data;
      // const newData = userData?.map((user, index) => ({
      //   ...user,
      //   id: user.Customer_ID,
      //   name: user.Customer_Name,
      //   phone: user.Phone_Number,
      //   status: (
      //     <Badge
      //       name={capitalize(user.Customer_Status)}
      //       color={user.Customer_Status === "active" ? "green" : "error"}
      //     />
      //   ),
      //   orders: user.Email,
      // }));
      setProductions(Array.isArray(userData) ? userData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch production details error:", error);
      setLoading(false);
      toast.error("Failed to load production details");
    }
  };

  const loadProductionSales = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/oxygen/shifted-oxygen-item`, {
        Cache_Status: "pending",
      });
      if (response.data?.error || response.data?.code >= 400) {
        // setLoading(false);
        // toast.error(
        //   response.data.error || "Failed to fetch production details"
        // );
        return;
      }

      if (!response.ok) {
        // setLoading(false);
        // toast.error(
        //   response.data?.error || "Failed to fetch production details"
        // );
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data;
      // const newData = userData?.map((user, index) => ({
      //   ...user,
      //   id: user.Customer_ID,
      //   name: user.Customer_Name,
      //   phone: user.Phone_Number,
      //   status: (
      //     <Badge
      //       name={capitalize(user.Customer_Status)}
      //       color={user.Customer_Status === "active" ? "green" : "error"}
      //     />
      //   ),
      //   orders: user.Email,
      // }));
      setSalesProductions(Array.isArray(userData) ? userData : []);
      // setLoading(false);
    } catch (error) {
      console.error("Fetch production details error:", error);
      // setLoading(false);
      // toast.error("Failed to load production details");
    }
  };

  return (
    <section className="p-6 space-y-6 bg-slate-50 min-h-full">
      <header className="flex flex-wrap justify-between gap-4 items-end">
        <div>
          <p className="text-xs font-semibold text-sky-600 uppercase">
            Oxygen & Liquid nitrogen management
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Daily dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Monitor operations, sales, and revenue activity.
          </p>
        </div>
        {/* <div className="text-xs text-slate-500">
          Dummy metrics · endpoints coming soon
        </div> */}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Oxygen Cylinders
            </h3>
            <MdOutlinePropaneTank className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{0}</p>
          <p className="text-xs text-blue-600 mt-2">
            {formatter.format(0)} total rooms
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Liquid Nitrogen
            </h3>
            <LuContainer className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatter.format(0)}
          </p>
          <p className="text-xs text-sky-600 mt-2">
            {formatter.format(0)} available beds
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total Customers
            </h3>
            <MdPeople className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatter.format(5)}
          </p>
          <p className="text-xs text-purple-600 mt-2">
            {formatter.format(2)}% occupancy rate
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Year Revenue</h3>
            <MdTrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">TZS 12.5M</p>
          <p className="text-xs text-green-600 mt-2">+10% from last year</p>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <WeeklyRevenueChart />
        <div className="grid grid-cols-1 gap-6">
          <SimpleTable
            title="Top suppliers today"
            headers={[
              { key: "customer", label: "Customer" },
              { key: "tanks", label: "Tanks purchased", align: "right" },
            ]}
            rows={stats.topCustomersToday.map((item) => ({
              ...item,
              tanks: numberFormatter.format(item?.customers || 0),
            }))}
          />
          <SimpleTable
            title="Tank type performance"
            headers={[
              { key: "name", label: "Item name" },
              { key: "sold", label: "Units sold", align: "right" },
            ]}
            rows={stats.unitsSoldPerItemToday.map((item) => ({
              ...item,
              sold: numberFormatter.format(item?.sold || 0),
            }))}
          />
        </div>
      </div> */}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div
          onClick={() => navigate("/projects/ocygen/payments")}
          className="flex justify-between cursor-pointer"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Recent Payments & Updates
          </h3>
          <FiArrowRight className="w-5 h-5 text-slate-400 hover:text-sky-600 transition-colors" />
        </div>
        <div className="space-y-4">
          {[
            {
              id: 1,
              type: "Payment",
              property: "25L Oxygen Cylinder",
              time: "1 hour ago",
              status: "Completed",
            },
            {
              id: 2,
              type: "Payment",
              property: "50L Oxygen Cylinder",
              time: "3 hours ago",
              status: "Completed",
            },
            {
              id: 3,
              type: "Payment",
              property: "50Kg Liquid Nitrogen",
              time: "5 hours ago",
              status: "Completed",
            },
            {
              id: 4,
              type: "Booking",
              property: "25L Oxygen Cylinder",
              time: "1 day ago",
              status: "Pending",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 pb-4 border-b last:border-b-0"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MdOutlineGasMeter className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {item.type} - {item.property}
                </p>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  item.status === "Completed" ||
                  item.status === "Confirmed" ||
                  item.status === "Received"
                    ? "text-green-600 bg-green-50"
                    : "text-yellow-600 bg-yellow-50"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
        <div className="py-2 border-t border-slate-100">
          <p
            onClick={() => navigate("/projects/oxygen/payments")}
            className="cursor-pointer text-sm hover:text-blue-900 text-sky-600 font-medium text-center group-hover:text-sky-700"
          >
            View all payments →
          </p>
        </div>
      </div>

      {/* Management Section */}
      <div className="pt-8 border-t border-slate-200">
        <header className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage customers and oxygen tank inventory
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ManagementCard
            title="Customers"
            icon={FiUsers}
            items={customers}
            header={"Status"}
            headerValue={"Customer_Status"}
            route="/projects/oxygen/customers"
          />
          <ManagementCard
            title="Payment Items"
            icon={FiPackage}
            items={items}
            header={"Price"}
            headerValue={"Item_Price_Inside"}
            route="/projects/oxygen/items"
          />
          <ManagementCard
            title="Productions"
            icon={FiPackage}
            items={productions}
            tableHeader={"Date"}
            route="/projects/oxygen/productions"
          />
          <ManagementCard
            title="Pending Transfers To Sales"
            icon={FiPackage}
            items={salesProductions}
            header={"Status"}
            tableHeader={"Date"}
            headerValue={"Cache_Status"}
            route="/projects/oxygen/pending-transfers"
          />
          <ManagementCard
            title="Point Of Sales"
            icon={FiPackage}
            items={[]}
            route="/projects/oxygen/point-of-sales"
          />
          <ManagementCard
            title="Sales Orders"
            icon={FiPackage}
            items={productions}
            header={"Status"}
            route="/projects/oxygen/sales-orders"
          />
        </div>
      </div>
    </section>
  );
};

export default OxygenManagement;
