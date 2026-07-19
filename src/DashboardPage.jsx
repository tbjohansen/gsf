import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import moment from "moment";
import {
  DollarSign,
  Users,
  Filter,
  Download,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ChevronDown,
  CheckCircle,
  Clock,
} from "lucide-react";

// Hex values kept only for Recharts SVG props (cannot use Tailwind there)
const C = {
  blue: "#2563EB",
  violet: "#7C3AED",
  emerald: "#059669",
  amber: "#D97706",
  rose: "#DC2626",
  cyan: "#0891B2",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate400: "#94A3B8",
  slate600: "#475569",
};

const CHART_COLORS = [C.blue, C.violet, C.emerald, C.amber, C.rose, C.cyan];

const STATUS_COLORS = {
  requested: C.violet,
  served: C.emerald,
  rejected: C.rose,
  pending: C.amber,
  expired: C.slate400,
};

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide capitalize bg-blue-50 text-blue-700 border border-blue-200">
    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
    {children}
  </span>
);

// ── Select wrapper ────────────────────────────────────────────────────────────
const Select = ({ value, onChange, children }) => (
  <div className="relative flex items-center">
    <select
      value={value}
      onChange={onChange}
      className="appearance-none pl-3 pr-8 py-2 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm cursor-pointer outline-none min-w-[130px] shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-blue-100 transition"
    >
      {children}
    </select>
    <ChevronDown
      size={12}
      className="absolute right-2.5 text-slate-400 pointer-events-none"
    />
  </div>
);

// ── Chart type toggle ─────────────────────────────────────────────────────────
const ChartToggle = ({ value, onChange }) => (
  <div className="flex bg-slate-100 border border-slate-200 rounded-lg overflow-hidden">
    {[
      { k: "bar", Icon: BarChart3, label: "Bar" },
      { k: "line", Icon: LineChartIcon, label: "Area" },
      { k: "pie", Icon: PieChartIcon, label: "Pie" },
    ].map(({ k, Icon, label }) => (
      <button
        key={k}
        onClick={() => onChange(k)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-r border-slate-200 transition-colors last:border-r-0
          ${value === k ? "bg-blue-50 text-blue-600" : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
      >
        <Icon size={13} /> {label}
      </button>
    ))}
  </div>
);

// ── KPI card ──────────────────────────────────────────────────────────────────
const accentMap = {
  blue: { bar: "bg-blue-600", icon: "bg-blue-50", text: "text-blue-600" },
  violet: {
    bar: "bg-violet-600",
    icon: "bg-violet-50",
    text: "text-violet-600",
  },
  emerald: {
    bar: "bg-emerald-600",
    icon: "bg-emerald-50",
    text: "text-emerald-600",
  },
  amber: { bar: "bg-amber-500", icon: "bg-amber-50", text: "text-amber-600" },
};

const KpiCard = ({ label, value, sub, icon: Icon, color, trend }) => {
  const a = accentMap[color] || accentMap.blue;
  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl p-5 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${a.bar} opacity-70`}
      />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
            {label}
          </p>
          <p className="mt-2 mb-1 text-2xl font-bold text-slate-900 leading-none">
            {value}
          </p>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${a.icon} flex items-center justify-center shrink-0`}
        >
          <Icon size={19} className={a.text} />
        </div>
      </div>
      {trend != null && (
        <div
          className={`mt-3 flex items-center gap-1 text-[11px] font-semibold ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}
        >
          <ArrowUpRight size={12} className={trend < 0 ? "rotate-90" : ""} />
          {trend >= 0 ? "+" : ""}
          {trend}% vs prev. period
        </div>
      )}
    </div>
  );
};

// ── Chart tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs shadow-lg">
      <p className="text-slate-500 font-semibold mb-2">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ background: e.color }}
          />
          <span className="text-slate-500">{e.name}:</span>
          <span className="font-semibold text-slate-800">
            {e.name === "Revenue"
              ? `${Number(e.value).toLocaleString()} TZS`
              : Number(e.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const DashboardPage = ({ data = [] }) => {
  const [dateRange, setDateRange] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRequestType, setSelectedRequestType] = useState("all");

  const processedData = useMemo(() => {
    let d = [...data];
    if (selectedStatus !== "all")
      d = d.filter((i) => i.Customer_Status === selectedStatus);
    if (selectedRequestType !== "all")
      d = d.filter((i) => i.Request_Type === selectedRequestType);
    if (dateRange !== "all") {
      const starts = {
        month: moment().startOf("month"),
        quarter: moment().subtract(3, "months").startOf("month"),
        year: moment().subtract(1, "year").startOf("month"),
      };
      const startDate = starts[dateRange];
      if (startDate)
        d = d.filter((i) => moment(i.Request_Date).isSameOrAfter(startDate));
    }
    return d;
  }, [data, dateRange, selectedStatus, selectedRequestType]);

  const monthlyData = useMemo(() => {
    const m = {};
    processedData.forEach((item) => {
      const key = moment(item.Request_Date).format("MMM YY");
      if (!m[key])
        m[key] = {
          month: key,
          revenue: 0,
          requests: 0,
          served: 0,
          pending: 0,
          rejected: 0,
        };
      m[key].revenue += item.Price || 0;
      m[key].requests += 1;
      const s = item.Customer_Status;
      if (["served", "requested"].includes(s)) m[key].served += 1;
      else if (s === "pending") m[key].pending += 1;
      else if (s === "rejected") m[key].rejected += 1;
    });
    return Object.values(m);
  }, [processedData]);

  const requestTypeData = useMemo(() => {
    const m = {};
    processedData.forEach((i) => {
      const t = i?.Request_Type || "Unknown";
      if (!m[t]) m[t] = { name: t, value: 0, revenue: 0 };
      m[t].value += 1;
      m[t].revenue += i?.Price || 0;
    });
    return Object.values(m);
  }, [processedData]);

  const statusData = useMemo(() => {
    const m = {};
    processedData.forEach((i) => {
      const s = i?.Customer_Status || "Unknown";
      if (!m[s]) m[s] = { name: s, value: 0 };
      m[s].value += 1;
    });
    return Object.values(m);
  }, [processedData]);

  const topCustomers = useMemo(() => {
    const m = {};
    processedData.forEach((i) => {
      const name = i.customer?.Customer_Name || "Unknown";
      if (!m[name])
        m[name] = {
          name,
          revenue: 0,
          requests: 0,
          type: i.customer?.Customer_Nature || "—",
        };
      m[name].revenue += i.Price || 0;
      m[name].requests += 1;
    });
    return Object.values(m)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [processedData]);

  const kpis = useMemo(() => {
    const totalRevenue = processedData.reduce((s, i) => s + (i.Price || 0), 0);
    const totalRequests = processedData.length;
    const servedRequests = processedData.filter((i) =>
      ["served", "requested"].includes(i?.Customer_Status),
    );
    const pendingRequests = processedData.filter((i) =>
      ["pending", "requested"].includes(i.Customer_Status),
    );
    return {
      totalRevenue,
      totalRequests,
      servedCount: servedRequests.length,
      pendingCount: pendingRequests.length,
      servedRevenue: servedRequests.reduce((s, i) => s + (i.Price || 0), 0),
      pendingRevenue: pendingRequests.reduce((s, i) => s + (i.Price || 0), 0),
    };
  }, [processedData]);

  // Recharts still needs hex values for SVG props
  const axisStyle = {
    tick: { fill: C.slate400, fontSize: 11 },
    axisLine: { stroke: C.slate200 },
    tickLine: false,
  };
  const gridStyle = {
    stroke: C.slate300,
    strokeDasharray: "3 3",
    strokeOpacity: 0.5,
  };

  const renderMainChart = () => {
    if (chartType === "line")
      return (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.violet} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="month" {...axisStyle} />
            <YAxis yAxisId="l" {...axisStyle} />
            <YAxis yAxisId="r" orientation="right" {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="square"
              wrapperStyle={{ fontSize: 12, color: C.slate600 }}
            />
            <Area
              yAxisId="l"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={C.blue}
              fill="url(#gradRev)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              yAxisId="r"
              type="monotone"
              dataKey="requests"
              name="Requests"
              stroke={C.violet}
              fill="url(#gradReq)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      );

    if (chartType === "pie")
      return (
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie
              data={requestTypeData}
              cx="50%"
              cy="50%"
              outerRadius={130}
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              labelLine={{ stroke: C.slate300 }}
            >
              {requestTypeData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, n, p) => [
                `${v} requests · ${(p.payload.revenue || 0).toLocaleString()} TZS`,
                "Requests",
              ]}
            />
            <Legend
              iconType="square"
              wrapperStyle={{ fontSize: 12, color: C.slate600 }}
            />
          </PieChart>
        </ResponsiveContainer>
      );

    return (
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={monthlyData} barSize={18} barGap={4}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis dataKey="month" {...axisStyle} />
          <YAxis yAxisId="l" {...axisStyle} />
          <YAxis yAxisId="r" orientation="right" {...axisStyle} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="square"
            wrapperStyle={{ fontSize: 12, color: C.slate600 }}
          />
          <Bar
            yAxisId="l"
            dataKey="revenue"
            name="Revenue"
            fill={C.blue}
            radius={[3, 3, 0, 0]}
          />
          <Bar
            yAxisId="r"
            dataKey="requests"
            name="Requests"
            fill={C.violet}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans px-5 py-6">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold tracking-widest text-emerald-600 uppercase">
                Live
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              GSF Projects
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Financial analytics & request intelligence
            </p>
          </div>
          <div className="flex gap-2.5">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-500 text-sm font-medium shadow-sm hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition cursor-pointer">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 mb-5 shadow-sm flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 mr-1">
            <Filter size={13} className="text-slate-400" />
            <span className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
              Filters
            </span>
          </div>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="month">This month</option>
            <option value="quarter">Last quarter</option>
            <option value="year">Last year</option>
          </Select>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="requested">Requested</option>
            <option value="served">Served</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </Select>
          <Select
            value={selectedRequestType}
            onChange={(e) => setSelectedRequestType(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="farm">Farm</option>
            <option value="house_rent">House Rent</option>
            <option value="business_land">Business Land</option>
            <option value="oxygen">Oxygen</option>
          </Select>
          <div className="ml-auto">
            <ChartToggle value={chartType} onChange={setChartType} />
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <KpiCard
            label="Total Revenue"
            value={`${kpis.totalRevenue.toLocaleString()} TZS`}
            sub={`Across ${kpis.totalRequests} requests`}
            icon={DollarSign}
            color="blue"
            trend={8.4}
          />
          <KpiCard
            label="Total Requests"
            value={kpis.totalRequests.toLocaleString()}
            sub={`${kpis.servedCount} served · ${kpis.pendingCount} pending`}
            icon={Users}
            color="violet"
            trend={3.1}
          />
          <KpiCard
            label="Served Revenue"
            value={`${kpis.servedRevenue.toLocaleString()} TZS`}
            sub={`From ${kpis.servedCount} served requests`}
            icon={CheckCircle}
            color="emerald"
            trend={5.2}
          />
          <KpiCard
            label="Pending Revenue"
            value={`${kpis.pendingRevenue.toLocaleString()} TZS`}
            sub={`From ${kpis.pendingCount} pending requests`}
            icon={Clock}
            color="amber"
          />
        </div>

        {/* ── Main Chart ── */}
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 mb-5 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">
                Revenue & Requests Trend
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly performance · {monthlyData.length} months
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { label: "Revenue", color: "bg-blue-600" },
                { label: "Requests", color: "bg-violet-600" },
              ].map(({ label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-xs text-slate-500"
                >
                  <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          {renderMainChart()}
        </div>

        {/* ── Bottom Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Type Distribution
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={requestTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {requestTypeData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n, p) => [
                    `${v} · ${(p.payload.revenue || 0).toLocaleString()} TZS`,
                    "Requests",
                  ]}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{ fontSize: 11, color: C.slate600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Status Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData} barSize={32}>
                <CartesianGrid
                  stroke={C.slate300}
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: C.slate400, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: C.slate400, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [v, "Requests"]}
                  contentStyle={{
                    background: "#fff",
                    border: `1px solid ${C.slate200}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#0f172a",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((e, i) => (
                    <Cell
                      key={i}
                      fill={
                        STATUS_COLORS[e.name] ||
                        CHART_COLORS[i % CHART_COLORS.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Top Customers Table ── */}
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Top Customers by Revenue
            </h3>
            <span className="text-[11px] text-slate-400">
              Showing top {topCustomers.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {[
                    "#",
                    "Customer",
                    "Type",
                    "Revenue",
                    "Requests",
                    "Avg. Value",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3.5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3.5 py-3 text-slate-400 border-b border-slate-100">
                      {i + 1}
                    </td>
                    <td className="px-3.5 py-3 font-medium text-slate-900 border-b border-slate-100">
                      {c.name}
                    </td>
                    <td className="px-3.5 py-3 border-b border-slate-100">
                      <Pill>{c.type}</Pill>
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-slate-900 border-b border-slate-100">
                      {c.revenue.toLocaleString()} TZS
                    </td>
                    <td className="px-3.5 py-3 text-slate-500 border-b border-slate-100">
                      {c.requests}
                    </td>
                    <td className="px-3.5 py-3 text-slate-500 border-b border-slate-100">
                      {Math.round(c.revenue / c.requests).toLocaleString()} TZS
                    </td>
                  </tr>
                ))}
                {topCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3.5 py-9 text-center text-slate-400 text-sm"
                    >
                      No data to display
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          GSF Projects · {moment().year()} ·{" "}
          {processedData.length.toLocaleString()} records loaded
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
