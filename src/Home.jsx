import {
  MdAssignmentAdd,
  MdOutlineListAlt,
  MdPeople,
  MdTrendingUp,
} from "react-icons/md";
import { BiBuildingHouse, BiSolidBuildings } from "react-icons/bi";
import { FaHome } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import apiClient from "./api/Client";
import {
  capitalize,
  currencyFormatter,
  formatter,
  removeUnderscore,
} from "../helpers";
import ManagementCard from "./components/ManagementCard";
import { PiStudent } from "react-icons/pi";
import { RiListSettingsLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { AiOutlineMessage } from "react-icons/ai";
import { IoBed } from "react-icons/io5";
import { GiPayMoney } from "react-icons/gi";

/* ------------------------------------------------------------------ */
/* Request helpers (can be moved to ./api/ later and reused elsewhere) */
/* ------------------------------------------------------------------ */

const CACHE_TTL_MS = 60 * 1000; // reuse responses for 60s (e.g. navigating back to Home)
const MAX_RETRIES = 3;
const cache = new Map(); // url -> { time, promise }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// GET with retry + exponential backoff on 429 (honours Retry-After header)
const getWithRetry = async (url) => {
  for (let attempt = 0; ; attempt++) {
    const response = await apiClient.get(url);
    if (response?.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(response.headers?.["retry-after"]);
      const delay = retryAfter
        ? retryAfter * 1000
        : 800 * 2 ** attempt + Math.random() * 300;
      await sleep(delay);
      continue;
    }
    return response;
  }
};

// Dedupes identical in-flight requests (StrictMode double effects, remounts)
// and caches successful responses for CACHE_TTL_MS.
const cachedGet = (url) => {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.time < CACHE_TTL_MS) return hit.promise;

  const promise = getWithRetry(url).then((response) => {
    const failed =
      !response?.ok || response.data?.error || response.data?.code >= 400;
    if (failed) cache.delete(url); // don't cache errors
    return failed ? null : response.data;
  });

  cache.set(url, { time: Date.now(), promise });
  return promise;
};

// Runs async tasks with at most `limit` running at the same time
const runWithLimit = async (tasks, limit) => {
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const task = tasks[next++];
      try {
        await task();
      } catch (error) {
        console.error("Dashboard request failed:", error);
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  );
};

const withKeys = (list) =>
  Array.isArray(list) ? list.map((row, i) => ({ ...row, key: i + 1 })) : [];

/* ------------------------------------------------------------------ */

const formatTimeAgo = (dateString) => {
  const diffInSeconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

const setups = [
  { name: "Academic Year", status: "active" },
  { name: "Payment Categories", status: "active" },
  { name: "Revoke Allocation Reasons", status: "active" },
];

const Home = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [items, setItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [stats, setStatistics] = useState(null);
  const [bedStats, setBedStatistics] = useState([]);
  const [studentRooms, setRooms] = useState([]);
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [access, setAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    // Builds a task: fetch url -> pick data from response -> set state
    const load = (url, pick, setter) => async () => {
      const data = await cachedGet(url);
      if (active && data) setter(pick(data));
    };

    // Phase 1: what's visible at the top of the page
    const criticalTasks = [
      load("/customer/hostel-statistics", (d) => d?.data, setStatistics),
      load(
        "/customer/hostel-bed-statistics",
        (d) => (Array.isArray(d?.data) ? d.data : []),
        setBedStatistics,
      ),
      load(
        "/customer/customer-request?&Request_Type=hostel",
        (d) => withKeys(d?.data?.data),
        setPayments,
      ),
    ];

    // Phase 2: management cards further down
    const secondaryTasks = [
      load("/settings/hostel", (d) => withKeys(d?.data), setHostels),
      load(
        "/customer/customer?&Customer_Nature=student",
        (d) => withKeys(d?.data?.data),
        setStudents,
      ),
      load(
        "/request-access?&limit=25&page=1",
        (d) => withKeys(d),
        setAccess,
      ),
      load(
        "/customer/customer-request?&Customer_Status=paid&Room_Status=paid&Request_Type=hostel",
        (d) => withKeys(d?.data?.data),
        setAssigned,
      ),
      load(
        "/customer/customer-request?&Customer_Status=served&Room_Status=paid&Request_Type=hostel",
        (d) => withKeys(d?.data?.data),
        setRooms,
      ),
      load(
        "/customer/hostel-beloe-five-month",
        (d) => (Array.isArray(d?.data?.data) ? d.data.data : []),
        setMonthlyPayments,
      ),
      load("/settings/sms", (d) => withKeys(d?.data?.data), setMessages),
      load(
        "/settings/item?&Item_Type=student_accomodatio,caution_money",
        (d) => withKeys(d?.data),
        setItems,
      ),
      load(
        "/settings/reason?&Project_Type=hostel",
        (d) => withKeys(d?.data?.data),
        setReasons,
      ),
    ];

    (async () => {
      await runWithLimit(criticalTasks, 3);
      if (active) setStatsLoading(false);

      await runWithLimit(secondaryTasks, 2);
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const bedTotals = useMemo(() => {
    const sum = (field) =>
      bedStats.reduce((acc, row) => acc + (Number(row?.[field]) || 0), 0);
    return {
      totalBeds: sum("total_beds"),
      totalOccupiedBeds: sum("occupied_beds"),
      totalRemainingBeds: sum("remaining_beds"),
      totalRevenue: sum("occupied_total_price"),
      totalMale: sum("total_male"),
      totalFemale: sum("total_female"),
      totalOccupiedGender: sum("total_occupied_gender"),
    };
  }, [bedStats]);

  const occupancyRate = bedTotals.totalBeds
    ? parseFloat(
        ((bedTotals.totalOccupiedBeds / bedTotals.totalBeds) * 100).toFixed(2),
      )
    : 0;

  const getStatusInfo = (item) => {
    if (item?.Customer_Status === "served" || item?.Customer_Status === "paid")
      return { label: "Served", color: "text-green-600 bg-green-50" };
    if (item?.Customer_Status === "requested" && item?.Received_Time)
      return { label: "Requested", color: "text-blue-600 bg-blue-50" };
    if (item?.Customer_Status === "requested")
      return { label: "Pending", color: "text-yellow-600 bg-yellow-50" };
    if (item?.sangira?.Sangira_Status === "pending")
      return {
        label: "Pending Payment",
        color: "text-yellow-600 bg-yellow-50",
      };
    if (item?.Customer_Status === "expired")
      return { label: "Expired", color: "text-red-600 bg-red-50" };
    return { label: "Processing", color: "text-gray-600 bg-gray-50" };
  };

  const goToPayments = () => navigate("/projects/hostels/payments");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Student Hostels
              </h3>
              <BiSolidBuildings className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {statsLoading ? "…" : stats?.totalHostel || 0}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              {formatter.format(stats?.totalRooms || 0)} total rooms
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Beds</h3>
              <IoBed className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {statsLoading ? "…" : formatter.format(stats?.totalBeds || 0)}
            </p>
            <p className="text-xs text-sky-600 mt-2">
              {formatter.format(bedTotals.totalRemainingBeds)} available beds
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Occupants
              </h3>
              <MdPeople className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {statsLoading
                ? "…"
                : formatter.format(bedTotals.totalOccupiedBeds)}
            </p>
            <p className="text-xs text-purple-600 mt-2">
              {formatter.format(occupancyRate)}% occupancy rate
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Year Revenue
              </h3>
              <MdTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {statsLoading
                ? "…"
                : currencyFormatter.format(bedTotals.totalRevenue)}
            </p>
            <p className="text-xs text-green-600 mt-2">+1% from last year</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div
            onClick={goToPayments}
            onKeyDown={(e) => e.key === "Enter" && goToPayments()}
            role="button"
            tabIndex={0}
            className="flex justify-between cursor-pointer"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Recent Payments & Updates
            </h3>
            <FiArrowRight className="w-5 h-5 text-slate-400 hover:text-sky-600 transition-colors" />
          </div>

          <div className="space-y-4">
            {payments.slice(0, 4).map((item) => {
              const statusInfo = getStatusInfo(item);

              // Use Served_Date for served items without sangira, otherwise Request_Date
              const displayDate =
                item?.Customer_Status === "served" && !item.Sangira_ID
                  ? item.Served_Date
                  : item.Request_Date;

              const hostelName = item?.room?.hostel?.Hostel_Name || "N/A";
              const blockName = item?.room?.block?.Block_Name || "N/A";
              const floorName = item?.room?.flow?.Flow_Name || "N/A";
              const roomName = item?.room?.Room_Name || "N/A";

              return (
                <div
                  key={item?.Request_ID ?? item.key}
                  className="flex items-center gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaHome className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {`${capitalize(removeUnderscore(item?.Request_Type))} - ${hostelName} - ${blockName} - ${floorName} - ${roomName}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(displayDate)}
                    </p>
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
              onClick={goToPayments}
              onKeyDown={(e) => e.key === "Enter" && goToPayments()}
              role="button"
              tabIndex={0}
              className="cursor-pointer text-sm hover:text-blue-900 text-sky-600 font-medium text-center"
            >
              View all payments →
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <header className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Management</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage student accommodation details and payment items
            </p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ManagementCard
              title="Hostels"
              icon={BiBuildingHouse}
              items={hostels}
              route="/projects/hostels/list"
              header={"Status"}
              headerValue={"Hostel_Status"}
            />
            <ManagementCard
              title="Students"
              icon={PiStudent}
              items={students}
              route="/projects/hostels/students"
              header={"Status"}
              headerValue={"Customer_Status"}
            />
            <ManagementCard
              title="Pending Access Requests"
              icon={MdAssignmentAdd}
              items={access}
              route="/projects/hostels/pending-access-requests"
              header={"Status"}
              headerValue={"Room_Status"}
            />
            <ManagementCard
              title="Pending Room Assignment"
              icon={MdAssignmentAdd}
              items={assigned}
              route="/projects/hostels/pending-room-assignments"
              header={"Status"}
              headerValue={"Room_Status"}
            />
            <ManagementCard
              title="Students Assigned Rooms"
              icon={MdAssignmentAdd}
              items={studentRooms}
              route="/projects/hostels/students-rooms"
              header={"Status"}
              headerValue={"Room_Status"}
            />
            <ManagementCard
              title="Monthly Payments"
              icon={GiPayMoney}
              items={monthlyPayments}
              route="/projects/hostels/monthly-payments"
              header={"Months"}
              headerValue={"Quantity"}
            />
            <ManagementCard
              title="Setups"
              icon={RiListSettingsLine}
              items={setups}
              route="/projects/hostels/setups"
              header={"Status"}
              headerValue={"status"}
            />
            <ManagementCard
              title="Broadcast Announcements"
              icon={AiOutlineMessage}
              items={messages}
              route="/projects/hostels/announcements"
              tableHeader={"Date"}
              header={"Status"}
              headerValue={"status"}
            />
            <ManagementCard
              title="Rooms Statistics"
              icon={AiOutlineMessage}
              items={[]}
              route="/projects/hostels/rooms-statistics"
              tableHeader={"Date"}
              header={"Status"}
              headerValue={"status"}
            />
            <ManagementCard
              title="Payment Items"
              icon={MdOutlineListAlt}
              items={items}
              route="/projects/hostels/items"
              header={"Status"}
              headerValue={"Item_Status"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;