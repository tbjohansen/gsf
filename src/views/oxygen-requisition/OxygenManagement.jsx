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
import { capitalize, formatter, removeUnderscore } from "../../../helpers";
import {
  MdOutlineGasMeter,
  MdOutlinePropaneTank,
  MdPeople,
  MdTrendingUp,
} from "react-icons/md";
import { LuContainer } from "react-icons/lu";
import ManagementCard from "../../components/ManagementCard";
import { RiListSettingsLine } from "react-icons/ri";

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

  const [summaryData, setSummary] = useState("");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  React.useEffect(() => {
    loadCustomers();
    loadData();
    loadProductions();
    loadProductionSales();
    loadPaymentsData();
    loadSummaryData();
  }, []);

  const loadPaymentsData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        "/oxygen/oxygen-request?&Billing_Type=cash,cash_deposit",
      );

      if (!response.ok) {
        setLoading(false);
        // toast.error(response.data?.error || "Failed to fetch employees");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        // toast.error(response.data.error || "Failed to fetch employees");
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data;
      const newData = userData?.map((user, index) => ({
        ...user,
        key: index + 1,
      }));
      // console.log(newData);
      setPayments(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setLoading(false);
      // toast.error("Failed to load employees");
    }
  };

  const loadSummaryData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/oxygen/oxygen-details");

      if (!response.ok) {
        setLoading(false);
        // toast.error(response.data?.error || "Failed to fetch employees");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        // toast.error(response.data.error || "Failed to fetch employees");
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data;
      setSummary(userData);

      setLoading(false);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setLoading(false);
      // toast.error("Failed to load employees");
    }
  };

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
        `/customer/customer?Customer_Nature=oxygen&limit=1000&page=1`,
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
          response.data.error || "Failed to fetch production details",
        );
        return;
      }

      if (!response.ok) {
        setLoading(false);
        toast.error(
          response.data?.error || "Failed to fetch production details",
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

    const setups = [
    { name: "Rejection Reasons", status: "active" },
  ];

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000)
      // Less than 30 days
      return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000)
      // Less than 365 days
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;

    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  return (
    <section className="p-6 space-y-6 bg-slate-50 min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Production Balance
            </h3>
            <MdOutlinePropaneTank className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatter.format(summaryData?.totalProductionBalance || 0)}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            available Oxygen cylinders
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Sales Balance</h3>
            <LuContainer className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatter.format(summaryData?.totalSalesBalance || 0)}
          </p>
          <p className="text-xs text-sky-600 mt-2">
            available Oxygen Cylinders
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
            {formatter.format(customers?.length || 0)}
          </p>
          <p className="text-xs text-purple-600 mt-2">
            {/* {formatter.format(2)}% occupancy rate */}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Paid Amount</h3>
            <MdTrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {currencyFormatter.format(summaryData?.totalPaidAmount || 0)}
          </p>
          <p className="text-xs text-green-600 mt-2"></p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div
          onClick={() => navigate("/projects/oxygen/payments")}
          className="flex justify-between cursor-pointer"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Recent Payments & Updates
          </h3>
          <FiArrowRight className="w-5 h-5 text-slate-400 hover:text-sky-600 transition-colors" />
        </div>
        <div className="space-y-4">
          {payments?.slice(0, 4).map((item) => {
            // Determine status display
            const getStatusInfo = () => {
              if (item?.request[0]?.Customer_Status === "served") {
                return {
                  label: "Served",
                  color: "text-green-600 bg-green-50",
                };
              } else if (item?.request[0]?.Customer_Status === "paid") {
                return {
                  label: "Paid",
                  color: "text-green-600 bg-green-50",
                };
              } else if (
                item?.request[0]?.Customer_Status === "requested" &&
                item.Received_Time
              ) {
                return {
                  label: "Requested",
                  color: "text-blue-600 bg-blue-50",
                };
              } else if (item?.request[0]?.Customer_Status === "requested") {
                return {
                  label: "Pending",
                  color: "text-yellow-600 bg-yellow-50",
                };
              } else if (item.sangira?.Sangira_Status === "pending") {
                return {
                  label: "Pending Payment",
                  color: "text-yellow-600 bg-yellow-50",
                };
              } else if (item?.request[0]?.Customer_Status === "expired") {
                return {
                  label: "Expired",
                  color: "text-red-600 bg-red-50",
                };
              }
              return {
                label: "Processing",
                color: "text-gray-600 bg-gray-50",
              };
            };

            const statusInfo = getStatusInfo();

            // Use Served_Date for served items without sangira, otherwise use Request_Date
            const displayDate = item?.Request_Batch_Date;

            const timeAgo = formatTimeAgo(displayDate);
            const itemName = item?.item?.Item_Name || "N/A";

            return (
              <div
                key={item?.Request_ID}
                className="flex items-center gap-4 pb-4 border-b last:border-b-0"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MdOutlineGasMeter className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {`${capitalize(removeUnderscore(item?.Request_Type))}
                              - Cylinder`}
                  </p>
                  <p className="text-xs text-gray-500">{timeAgo}</p>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            );
          })}
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
            title="Transfers To Sales"
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
            tableHeader={"Click here to create customer order"}
            route="/projects/oxygen/point-of-sales"
          />
          <ManagementCard
            title="Sales & Orders"
            icon={FiPackage}
            items={productions}
            tableHeader={"Date"}
            headerValue={"Cache_Status"}
            route="/projects/oxygen/sales-orders"
          />

          <ManagementCard
            title="Sales & Cylinders Stock"
            icon={FiPackage}
            items={items}
            header={"GSF Cylinders"}
            headerValue={"Gsf_Quantity"}
            route="/projects/oxygen/cylinder-inventory"
          />
          <ManagementCard
            title="Setups"
            icon={RiListSettingsLine}
            items={setups}
            route="/projects/oxygen/setups"
            header={"Status"}
            headerValue={"status"}
          />
        </div>
      </div>
    </section>
  );
};

export default OxygenManagement;
