import React, { useMemo, useState } from "react";
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
import { capitalize } from "../../../helpers";

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "TZS",
  maximumFractionDigits: 0,
});

const [data, setData] = useState({
  tanksDispensedToday: 0,
  gasOrdersToday: 0,
  revenueToday: 0,
  topTank: {
    name: "UltraPure 50L",
    unitsSoldToday: 0,
  },
});

useEffect(() => {
  console.log(data);
}, [data]);

const weeklyRevenueData = [
  { id: "mon", day: "Mon", amount: 6100 },
  { id: "tue", day: "Tue", amount: 5200 },
  { id: "wed", day: "Wed", amount: 6800 },
  { id: "thu", day: "Thu", amount: 7100 },
  { id: "fri", day: "Fri", amount: 6400 },
  { id: "sat", day: "Sat", amount: 8350 },
  { id: "sun", day: "Sun", amount: 9025 },
];

const StatCard = ({ icon: Icon, label, value, helper }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span className="font-medium">{label}</span>
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600">
        <Icon className="w-5 h-5" />
      </span>
    </div>
    <p className="text-3xl font-semibold text-slate-900">{value}</p>
    {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
  </div>
);

const WeeklyRevenueChart = () => {
  const points = React.useMemo(() => {
    const max = Math.max(...weeklyRevenueData.map((item) => item.amount));
    const min = Math.min(...weeklyRevenueData.map((item) => item.amount));
    const diff = max - min || 1;

    return weeklyRevenueData
      .map((item, index) => {
        const x = (index / (weeklyRevenueData.length - 1 || 1)) * 100;
        const y = 100 - ((item.amount - min) / diff) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, []);

  const today = weeklyRevenueData[weeklyRevenueData.length - 1];
  const total = weeklyRevenueData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Weekly revenue</p>
          <p className="text-2xl font-semibold text-slate-900">
            {currencyFormatter.format(total)}
          </p>
          {/* <p className="text-xs text-emerald-600 font-medium">
            Dummy data · waiting for API
          </p> */}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Today</p>
          <p className="text-lg font-semibold text-slate-900">
            {currencyFormatter.format(today.amount)}
          </p>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-48">
          <defs>
            <linearGradient
              id="oxygenRevenue"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="url(#oxygenRevenue)"
            strokeWidth="3"
            strokeLinecap="round"
            points={points}
          />
          <polygon
            points={`${points} 100,100 0,100`}
            fill="url(#oxygenRevenue)"
            opacity="0.3"
          />
        </svg>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          {weeklyRevenueData.map((item) => (
            <span key={item.id} className="flex-1 text-center">
              {item.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const SimpleTable = ({ title, headers, rows }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {/* <p className="text-xs text-slate-400">Dummy data · daily snapshot</p> */}
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                className={`pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                  header.align === "right" ? "text-right" : "text-left"
                }`}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-slate-100 last:border-b-0">
              {headers.map((header) => (
                <td
                  key={header.key}
                  className={`py-3 font-medium text-slate-700 ${
                    header.align === "right" ? "text-right" : "text-left"
                  }`}>
                  {row[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ManagementCard = ({ title, icon: Icon, items, onClick, route }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      navigate(route);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-all hover:border-sky-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-400">
              {items.length} {items.length === 1 ? "item" : "items"} available
            </p>
          </div>
        </div>
        <FiArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-left">
                Name
              </th>
              <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">
                {title === "Customers" ? "Status" : "Price (TZS)"}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 5).map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-100 last:border-b-0">
                <td className="py-3 font-medium text-slate-700">{item.name}</td>
                <td className="py-3 font-medium text-slate-700 text-right">
                  {title === "Customers"
                    ? item.status
                    : numberFormatter.format(item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length > 5 && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-sky-600 font-medium text-center group-hover:text-sky-700">
            View all {items.length} {title.toLowerCase()} →
          </p>
        </div>
      )}
    </div>
  );
};

const OxygenManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [itemManagement, setItemManagement] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    oxygenTanksDispensedToday: 0,
    oxygenTanksDispensedYesterday: 0,
    oxygenTanksOrdersToday: 0,
    oxygenTanksOrdersYesterday: 0,
    oxygenTanksRevenueToday: 0,
    oxygenTanksRevenueYesterday: 0,
    mostSoldTankToday: {
      name: "UltraPure 50L",
      unitsSold: 120,
    },
    topCustomersToday: [
      { id: "oxylife", customer: "OxyLife Medical", tanks: 58 },
      { id: "medisupply", customer: "MediSupply Africa", tanks: 44 },
      { id: "grandsphere", customer: "Grand Sphere Health", tanks: 39 },
      { id: "gasken", customer: "GasKen Partners", tanks: 31 },
      { id: "breathwell", customer: "BreathWell Clinics", tanks: 22 },
    ],
    unitsSoldPerItemToday: [
      { id: "u50", name: "UltraPure 50L", sold: 312 },
      { id: "compact15", name: "CompactCare 15L", sold: 204 },
      { id: "home10", name: "HomeCare 10L", sold: 158 },
      { id: "portable5", name: "Portable 5L", sold: 131 },
      { id: "industrial75", name: "Industrial 75L", sold: 96 },
    ],
    weeklyRevenueData: [
      { id: "mon", day: "Mon", date: "2025-01-01", amount: 6100 },
      { id: "tue", day: "Tue", date: "2025-01-02", amount: 5200 },
      { id: "wed", day: "Wed", date: "2025-01-03", amount: 6800 },
      { id: "thu", day: "Thu", date: "2025-01-04", amount: 7100 },
      { id: "fri", day: "Fri", date: "2025-01-05", amount: 6400 },
      { id: "sat", day: "Sat", date: "2025-01-06", amount: 8350 },
      { id: "sun", day: "Sun", date: "2025-01-07", amount: 9025 },
    ],
  });

  const statCards = useMemo(
    () => [
      {
        id: "dispensed",
        label: "Tanks dispensed today",
        value: numberFormatter.format(stats.oxygenTanksDispensedToday || 0),
        helper: "Up 18% vs yesterday",
        icon: FiActivity,
      },
      {
        id: "orders",
        label: "Gas orders today",
        value: numberFormatter.format(stats.oxygenTanksOrdersToday || 0),
        helper: "Avg 4.6 tanks per order",
        icon: FiShoppingBag,
      },
      {
        id: "revenue",
        label: "Revenue today",
        value: currencyFormatter.format(stats.oxygenTanksRevenueToday || 0),
        helper: "Target: TZS 50m",
        icon: FiDollarSign,
      },
      {
        id: "topTank",
        label: "Top tank",
        value: stats.mostSoldTankToday.name,
        helper: `${numberFormatter.format(
          stats.mostSoldTankToday.unitsSold || 0
        )} units sold today`,
        icon: FiAward,
      },
    ],
    [stats]
  );

  const [loading, setLoading] = useState(false);
  React.useEffect(() => {
    loadCustomers();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/settings/item?Item_Type=oxygen&limit=10&page=1`
      );

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
        price: Number(item.Item_Price),
        key: index + 1,
        status: "Active",
      }));
      console.log(newData);
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
  return (
    <section className="p-6 space-y-6 bg-slate-50 min-h-full">
      <header className="flex flex-wrap justify-between gap-4 items-end">
        <div>
          <p className="text-xs font-semibold text-sky-600 uppercase">
            Oxygen management
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Daily dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Monitor oxygen tank operations, revenue, and supplier activity.
          </p>
        </div>
        {/* <div className="text-xs text-slate-500">
          Dummy metrics · endpoints coming soon
        </div> */}
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
              tanks: numberFormatter.format(item.customers),
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
              sold: numberFormatter.format(item.sold),
            }))}
          />
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
            route="/oxygen/customers"
          />
          <ManagementCard
            title="Items"
            icon={FiPackage}
            items={items}
            route="/oxygen/items"
          />
        </div>
      </div>
    </section>
  );
};

export default OxygenManagement;
