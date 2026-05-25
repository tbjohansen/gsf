import { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Box,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  Button,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdInventory,
  MdShoppingCart,
  MdBuild,
  MdWarning,
  MdAdd,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdArrowForward,
  MdPerson,
  MdPhone,
  MdCalendarToday,
  MdNotes,
  MdConstruction,
  MdAssignmentReturn,
  MdArrowBack,
} from "react-icons/md";

/* ─── Design tokens ───────────────────────────────────────────────────── */
const C = {
  bg: "#f0f4f8",
  surface: "#f8fafc",
  card: "#ffffff",
  border: "#dce3ea",
  primary: "#1f4389",
  primaryLight: "#2d5bb5",
  primaryDark: "#162d5e",
  primaryBg: "#e8edf5",
  accent: "#f59e0b",
  accentLight: "#fbbf24",
  accentBg: "#fef3c7",
  success: "#059669",
  successLight: "#10b981",
  successBg: "#d1fae5",
  warning: "#d97706",
  warningBg: "#fef3c7",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  info: "#6366f1",
  infoBg: "#e0e7ff",
  muted: "#64748b",
  text: "#1e293b",
  textDim: "#94a3b8",
};

/* ─── Styled helpers ───────────────────────────────────────────────────── */
const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#f8fafc",
    color: C.textDim,
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottom: `1px solid ${C.border}`,
    padding: "10px 16px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: C.text,
    borderBottom: `1px solid ${C.border}`,
    padding: "14px 16px",
  },
}));

/* ─── Initial Data ────────────────────────────────────────────────────── */
const INITIAL_TYPES = [
  { id: 1, name: "Type A – 10L", total: 30, notes: "Medical grade" },
  { id: 2, name: "Type B – 5L", total: 20, notes: "Portable" },
  { id: 3, name: "Type C – 50L", total: 15, notes: "Industrial" },
];

const INITIAL_RENTALS = [
  {
    id: 1,
    customer: "Amina Juma",
    phone: "+255 712 345 678",
    typeId: 1,
    qty: 2,
    rentDate: "2026-05-10",
    returnDate: "2026-05-20",
    status: "active",
    notes: "",
  },
  {
    id: 2,
    customer: "John Mwangi",
    phone: "+255 754 222 333",
    typeId: 2,
    qty: 1,
    rentDate: "2026-05-12",
    returnDate: "2026-05-19",
    status: "active",
    notes: "",
  },
];

const INITIAL_REPAIRS = [
  {
    id: 3,
    typeId: 1,
    qty: 1,
    issue: "Valve leak",
    dateSent: "2026-05-08",
    tech: "ABC Workshop",
    status: "in repair",
  },
];

const INITIAL_DAMAGED = [
  {
    id: 4,
    typeId: 3,
    qty: 1,
    desc: "Dented body from fall",
    date: "2026-05-07",
    action: "pending",
  },
];

const INITIAL_ACTIVITY = [
  "Rental to Amina Juma (2× Type A – 10L)",
  "Repair logged for Type A – valve leak",
  "Damage recorded: Type C dented body",
];

/* ─── Helper Functions ────────────────────────────────────────────────── */
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => {
  if (!d) return "–";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

/* ─── Tab Panel ────────────────────────────────────────────────────────── */
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/* ─── Metric Card ──────────────────────────────────────────────────────── */
function MetricCard({ label, value, color = C.primary, icon: Icon }) {
  return (
    <Card className="shadow-sm border border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            {label}
          </span>
          <Icon size={20} style={{ color }} />
        </div>
        <div
          className="text-2xl font-extrabold"
          style={{ color, fontFamily: "'DM Mono', monospace" }}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Status Badge ──────────────────────────────────────────────────────── */
function StatusBadge({ variant = "default", children }) {
  const config = {
    success: { color: C.success, bg: C.successBg },
    info: { color: C.info, bg: C.infoBg },
    warning: { color: C.warning, bg: C.warningBg },
    danger: { color: C.danger, bg: C.dangerBg },
    default: { color: C.muted, bg: C.primaryBg },
  };
  const cfg = config[variant] || config.default;

  return (
    <Chip
      label={children}
      size="small"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: "bold",
        fontSize: 12,
      }}
    />
  );
}

/* ─── Tabs Config ──────────────────────────────────────────────────────── */
const TABS = [
  { id: 0, label: "Dashboard", icon: MdDashboard },
  { id: 1, label: "Inventory", icon: MdInventory },
  { id: 2, label: "Rentals", icon: MdShoppingCart },
  { id: 3, label: "Repairs", icon: MdBuild },
  { id: 4, label: "Damaged", icon: MdWarning },
];

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function GasCylinderInventory() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [types, setTypes] = useState(INITIAL_TYPES);
  const [rentals, setRentals] = useState(INITIAL_RENTALS);
  const [repairs, setRepairs] = useState(INITIAL_REPAIRS);
  const [damaged, setDamaged] = useState(INITIAL_DAMAGED);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [nextId, setNextId] = useState(10);
  const [loading, setLoading] = useState(false);

  const [invForm, setInvForm] = useState({
    name: "",
    total: "",
    notes: "",
    editId: null,
  });
  const [rentForm, setRentForm] = useState({
    customer: "",
    phone: "",
    typeId: "",
    qty: 1,
    rentDate: "",
    returnDate: "",
    notes: "",
  });
  const [repForm, setRepForm] = useState({
    typeId: "",
    qty: 1,
    issue: "",
    dateSent: "",
    tech: "",
  });
  const [dmgForm, setDmgForm] = useState({
    typeId: "",
    qty: 1,
    desc: "",
    date: "",
  });

  const newId = () => {
    const id = nextId;
    setNextId(id + 1);
    return id;
  };
  const pushActivity = (msg) => setActivity((prev) => [...prev, msg]);

  const getType = (id) =>
    types.find((t) => t.id === Number(id)) || { name: "Unknown" };

  const rentedCount = (typeId) =>
    rentals
      .filter((r) => r.typeId === Number(typeId) && r.status === "active")
      .reduce((s, r) => s + Number(r.qty), 0);
  const repairedCount = (typeId) =>
    repairs
      .filter((r) => r.typeId === Number(typeId) && r.status === "in repair")
      .reduce((s, r) => s + Number(r.qty), 0);
  const damagedCount = (typeId) =>
    damaged
      .filter((d) => d.typeId === Number(typeId) && d.action === "pending")
      .reduce((s, d) => s + Number(d.qty), 0);
  const availableCount = (t) =>
    Math.max(
      0,
      t.total - rentedCount(t.id) - repairedCount(t.id) - damagedCount(t.id),
    );

  const totalCyl = types.reduce((s, t) => s + t.total, 0);
  const totalRented = rentals
    .filter((r) => r.status === "active")
    .reduce((s, r) => s + Number(r.qty), 0);
  const totalRepair = repairs
    .filter((r) => r.status === "in repair")
    .reduce((s, r) => s + Number(r.qty), 0);
  const totalDamaged = damaged
    .filter((d) => d.action === "pending")
    .reduce((s, d) => s + Number(d.qty), 0);
  const totalAvail = totalCyl - totalRented - totalRepair - totalDamaged;

  /* ── CRUD Operations ─────────────────────────────────────────────────── */
  const saveType = () => {
    if (!invForm.name.trim()) return alert("Enter a type name");
    if (invForm.editId) {
      setTypes((prev) =>
        prev.map((t) =>
          t.id === invForm.editId
            ? {
                ...t,
                name: invForm.name,
                total: Number(invForm.total) || 0,
                notes: invForm.notes,
              }
            : t,
        ),
      );
    } else {
      setTypes((prev) => [
        ...prev,
        {
          id: newId(),
          name: invForm.name.trim(),
          total: Number(invForm.total) || 0,
          notes: invForm.notes,
        },
      ]);
      pushActivity(`New type added: ${invForm.name.trim()}`);
    }
    setInvForm({ name: "", total: "", notes: "", editId: null });
  };

  const deleteType = (id) => {
    if (confirm("Delete this type?"))
      setTypes((prev) => prev.filter((t) => t.id !== id));
  };
  const editType = (t) =>
    setInvForm({
      name: t.name,
      total: t.total,
      notes: t.notes || "",
      editId: t.id,
    });

  const addRental = () => {
    const { customer, phone, typeId, qty, rentDate, returnDate, notes } =
      rentForm;
    if (!customer.trim() || !typeId)
      return alert("Enter customer name and select a type");
    const t = getType(typeId);
    if (availableCount(t) < Number(qty))
      return alert(`Only ${availableCount(t)} cylinders available`);
    const r = {
      id: newId(),
      customer,
      phone,
      typeId: Number(typeId),
      qty: Number(qty),
      rentDate: rentDate || today(),
      returnDate,
      status: "active",
      notes,
    };
    setRentals((prev) => [...prev, r]);
    pushActivity(`Rental to ${customer} (${qty}× ${t.name})`);
    setRentForm({
      customer: "",
      phone: "",
      typeId: "",
      qty: 1,
      rentDate: "",
      returnDate: "",
      notes: "",
    });
  };

  const returnRental = (id) => {
    const r = rentals.find((x) => x.id === id);
    setRentals((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "returned" } : x)),
    );
    if (r)
      pushActivity(
        `Returned: ${r.customer} – ${r.qty}× ${getType(r.typeId).name}`,
      );
  };

  const addRepair = () => {
    const { typeId, qty, issue, dateSent, tech } = repForm;
    if (!typeId || !issue.trim())
      return alert("Select type and describe the issue");
    setRepairs((prev) => [
      ...prev,
      {
        id: newId(),
        typeId: Number(typeId),
        qty: Number(qty),
        issue,
        dateSent: dateSent || today(),
        tech,
        status: "in repair",
      },
    ]);
    pushActivity(`Repair logged: ${qty}× ${getType(typeId).name} – ${issue}`);
    setRepForm({ typeId: "", qty: 1, issue: "", dateSent: "", tech: "" });
  };

  const completeRepair = (id) => {
    const r = repairs.find((x) => x.id === id);
    setRepairs((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "completed" } : x)),
    );
    if (r)
      pushActivity(`Repair completed: ${r.qty}× ${getType(r.typeId).name}`);
  };

  const addDamaged = () => {
    const { typeId, qty, desc, date } = dmgForm;
    if (!typeId || !desc.trim())
      return alert("Select type and describe the damage");
    setDamaged((prev) => [
      ...prev,
      {
        id: newId(),
        typeId: Number(typeId),
        qty: Number(qty),
        desc,
        date: date || today(),
        action: "pending",
      },
    ]);
    pushActivity(`Damage recorded: ${qty}× ${getType(typeId).name} – ${desc}`);
    setDmgForm({ typeId: "", qty: 1, desc: "", date: "" });
  };

  const dmgAction = (id, action) => {
    const d = damaged.find((x) => x.id === id);
    setDamaged((prev) => prev.map((x) => (x.id === id ? { ...x, action } : x)));
    if (d) {
      if (action === "repair") {
        setRepairs((prev) => [
          ...prev,
          {
            id: newId(),
            typeId: d.typeId,
            qty: d.qty,
            issue: `Damaged – ${d.desc}`,
            dateSent: today(),
            tech: "",
            status: "in repair",
          },
        ]);
        pushActivity(
          `Damaged sent to repair: ${d.qty}× ${getType(d.typeId).name}`,
        );
      } else {
        pushActivity(`Written off: ${d.qty}× ${getType(d.typeId).name}`);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>
      {/* Header */}
      <div
        style={{
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px 0" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <IconButton
              onClick={() => navigate(-1)}
              className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <MdArrowBack />
            </IconButton>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: C.primary }}
            >
              <MdInventory size={20} />
            </div>
            <div>
              <h1 className="m-0 text-lg font-extrabold tracking-tight text-slate-800">
                OxyTrack
              </h1>
              <div className="text-xs text-slate-400">
                Cylinder Inventory Management
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            TabIndicatorProps={{ style: { backgroundColor: C.primary } }}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {TABS.map((t) => (
              <Tab
                key={t.id}
                icon={<t.icon size={18} />}
                label={t.label}
                iconPosition="start"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  color: C.textDim,
                  "&.Mui-selected": { color: C.primary },
                }}
              />
            ))}
          </Tabs>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* DASHBOARD */}
        <TabPanel value={tab} index={0}>
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <MetricCard
                label="Total cylinders"
                value={totalCyl}
                icon={MdInventory}
              />
              <MetricCard
                label="Available"
                value={totalAvail}
                color={C.success}
                icon={MdCheckCircle}
              />
              <MetricCard
                label="Rented out"
                value={totalRented}
                color={C.primary}
                icon={MdShoppingCart}
              />
              <MetricCard
                label="In repair"
                value={totalRepair}
                color={C.warning}
                icon={MdBuild}
              />
              <MetricCard
                label="Damaged"
                value={totalDamaged}
                color={C.danger}
                icon={MdWarning}
              />
            </div>

            <Paper
              sx={{ width: "100%", overflow: "hidden" }}
              className="shadow-sm border border-slate-200"
            >
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Type</StyledTableCell>
                      <StyledTableCell align="center">Total</StyledTableCell>
                      <StyledTableCell align="center">
                        Available
                      </StyledTableCell>
                      <StyledTableCell align="center">Rented</StyledTableCell>
                      <StyledTableCell align="center">
                        In Repair
                      </StyledTableCell>
                      <StyledTableCell align="center">Damaged</StyledTableCell>
                      <StyledTableCell>Notes</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ padding: 0 }}>
                          <LinearProgress />
                        </TableCell>
                      </TableRow>
                    )}
                    {types.map((t) => (
                      <TableRow
                        key={t.id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <StyledTableCell>
                          <span className="font-semibold">{t.name}</span>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {t.total}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <StatusBadge variant="success">
                            {availableCount(t)}
                          </StatusBadge>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <StatusBadge variant="info">
                            {rentedCount(t.id)}
                          </StatusBadge>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <StatusBadge variant="warning">
                            {repairedCount(t.id)}
                          </StatusBadge>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <StatusBadge variant="danger">
                            {damagedCount(t.id)}
                          </StatusBadge>
                        </StyledTableCell>
                        <StyledTableCell className="text-slate-400 text-sm">
                          {t.notes || "–"}
                        </StyledTableCell>
                      </TableRow>
                    ))}
                    {!types.length && !loading && (
                      <TableRow>
                        <StyledTableCell
                          colSpan={7}
                          className="text-center text-slate-400 py-8"
                        >
                          No cylinder types added yet
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </TabPanel>

        {/* INVENTORY */}
        <TabPanel value={tab} index={1}>
          <div>
            <Card className="shadow-sm border border-slate-200 mb-6">
              <CardContent className="p-5">
                <div className="font-bold text-slate-800 mb-4">
                  {invForm.editId ? "Edit Cylinder Type" : "Add Cylinder Type"}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <TextField
                    fullWidth
                    size="small"
                    label="Type Name"
                    placeholder="e.g. Type A – 10L"
                    value={invForm.name}
                    onChange={(e) =>
                      setInvForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Total Cylinders"
                    value={invForm.total}
                    onChange={(e) =>
                      setInvForm((f) => ({ ...f, total: e.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Notes"
                    placeholder="Pressure, supplier…"
                    value={invForm.notes}
                    onChange={(e) =>
                      setInvForm((f) => ({ ...f, notes: e.target.value }))
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="contained"
                    onClick={saveType}
                    className="normal-case font-semibold"
                    style={{ backgroundColor: C.primary }}
                    startIcon={invForm.editId ? <MdEdit /> : <MdAdd />}
                  >
                    {invForm.editId ? "Update Type" : "Add Type"}
                  </Button>
                  {invForm.editId && (
                    <Button
                      onClick={() =>
                        setInvForm({
                          name: "",
                          total: "",
                          notes: "",
                          editId: null,
                        })
                      }
                      className="normal-case text-slate-600"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Paper
              sx={{ width: "100%", overflow: "hidden" }}
              className="shadow-sm border border-slate-200"
            >
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Type</StyledTableCell>
                      <StyledTableCell align="center">Total</StyledTableCell>
                      <StyledTableCell align="center">
                        Available
                      </StyledTableCell>
                      <StyledTableCell align="center">Rented</StyledTableCell>
                      <StyledTableCell align="center">Damaged</StyledTableCell>
                      <StyledTableCell align="center">
                        In Repair
                      </StyledTableCell>
                      <StyledTableCell>Notes</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ padding: 0 }}>
                          <LinearProgress />
                        </TableCell>
                      </TableRow>
                    )}
                    {types.map((t) => (
                      <TableRow
                        key={t.id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <StyledTableCell>
                          <span className="font-semibold">{t.name}</span>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {t.total}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <StatusBadge variant="success">
                            {availableCount(t)}
                          </StatusBadge>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <StatusBadge variant="info">
                            {rentedCount(t.id)}
                          </StatusBadge>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <StatusBadge variant="danger">
                            {damagedCount(t.id)}
                          </StatusBadge>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <StatusBadge variant="warning">
                            {repairedCount(t.id)}
                          </StatusBadge>
                        </StyledTableCell>
                        <StyledTableCell className="text-slate-400 text-sm">
                          {t.notes || "–"}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <div className="flex gap-2 justify-center">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => editType(t)}
                                className="text-slate-600"
                              >
                                <MdEdit size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => deleteType(t.id)}
                                className="text-red-600"
                              >
                                <MdDelete size={16} />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </StyledTableCell>
                      </TableRow>
                    ))}
                    {!types.length && !loading && (
                      <TableRow>
                        <StyledTableCell
                          colSpan={8}
                          className="text-center text-slate-400 py-8"
                        >
                          No cylinder types added yet
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </TabPanel>

        {/* RENTALS */}
        <TabPanel value={tab} index={2}>
          <div>
            <Card className="shadow-sm border border-slate-200 mb-6">
              <CardContent className="p-5">
                <div className="font-bold text-slate-800 mb-4">New Rental</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <TextField
                    fullWidth
                    size="small"
                    label="Customer Name"
                    placeholder="Full name"
                    value={rentForm.customer}
                    onChange={(e) =>
                      setRentForm((f) => ({ ...f, customer: e.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Phone / Contact"
                    placeholder="+255 …"
                    value={rentForm.phone}
                    onChange={(e) =>
                      setRentForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Cylinder Type"
                    value={rentForm.typeId}
                    onChange={(e) =>
                      setRentForm((f) => ({ ...f, typeId: e.target.value }))
                    }
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select type…</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({availableCount(t)} available)
                      </option>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Quantity"
                    value={rentForm.qty}
                    onChange={(e) =>
                      setRentForm((f) => ({ ...f, qty: e.target.value }))
                    }
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Rental Date"
                    value={rentForm.rentDate}
                    onChange={(e) =>
                      setRentForm((f) => ({ ...f, rentDate: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Expected Return"
                    value={rentForm.returnDate}
                    onChange={(e) =>
                      setRentForm((f) => ({ ...f, returnDate: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                <TextField
                  fullWidth
                  size="small"
                  label="Notes"
                  placeholder="Additional notes"
                  value={rentForm.notes}
                  onChange={(e) =>
                    setRentForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="mb-4"
                />
                <Button
                  variant="contained"
                  onClick={addRental}
                  className="normal-case font-semibold"
                  style={{ backgroundColor: C.primary }}
                  startIcon={<MdShoppingCart />}
                >
                  Record Rental
                </Button>
              </CardContent>
            </Card>

            <Paper
              sx={{ width: "100%", overflow: "hidden" }}
              className="shadow-sm border border-slate-200"
            >
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Customer</StyledTableCell>
                      <StyledTableCell>Contact</StyledTableCell>
                      <StyledTableCell>Type</StyledTableCell>
                      <StyledTableCell align="center">Qty</StyledTableCell>
                      <StyledTableCell>Rented</StyledTableCell>
                      <StyledTableCell>Due Back</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell align="center">Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ padding: 0 }}>
                          <LinearProgress />
                        </TableCell>
                      </TableRow>
                    )}
                    {rentals
                      .filter((r) => r.status === "active")
                      .map((r) => {
                        const overdue =
                          r.returnDate && new Date(r.returnDate) < new Date();
                        return (
                          <TableRow
                            key={r.id}
                            hover
                            sx={{
                              "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                              },
                            }}
                          >
                            <StyledTableCell>
                              <span className="font-semibold">
                                {r.customer}
                              </span>
                            </StyledTableCell>
                            <StyledTableCell className="text-slate-500 text-sm">
                              {r.phone || "–"}
                            </StyledTableCell>
                            <StyledTableCell>
                              {getType(r.typeId).name}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {r.qty}
                            </StyledTableCell>
                            <StyledTableCell className="text-sm">
                              {fmtDate(r.rentDate)}
                            </StyledTableCell>
                            <StyledTableCell
                              className="text-sm"
                              style={{ color: overdue ? C.danger : undefined }}
                            >
                              {fmtDate(r.returnDate)}
                            </StyledTableCell>
                            <StyledTableCell>
                              <StatusBadge
                                variant={overdue ? "danger" : "info"}
                              >
                                {overdue ? "Overdue" : "Active"}
                              </StatusBadge>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => returnRental(r.id)}
                                className="normal-case font-semibold text-xs"
                                style={{ backgroundColor: C.success }}
                                startIcon={<MdCheckCircle />}
                              >
                                Return
                              </Button>
                            </StyledTableCell>
                          </TableRow>
                        );
                      })}
                    {!rentals.filter((r) => r.status === "active").length &&
                      !loading && (
                        <TableRow>
                          <StyledTableCell
                            colSpan={8}
                            className="text-center text-slate-400 py-8"
                          >
                            No active rentals
                          </StyledTableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </TabPanel>

        {/* REPAIRS */}
        <TabPanel value={tab} index={3}>
          <div>
            <Card className="shadow-sm border border-slate-200 mb-6">
              <CardContent className="p-5">
                <div className="font-bold text-slate-800 mb-4">Log Repair</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Cylinder Type"
                    value={repForm.typeId}
                    onChange={(e) =>
                      setRepForm((f) => ({ ...f, typeId: e.target.value }))
                    }
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select type…</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Quantity"
                    value={repForm.qty}
                    onChange={(e) =>
                      setRepForm((f) => ({ ...f, qty: e.target.value }))
                    }
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Issue / Reason"
                    placeholder="e.g. Valve leak, pressure loss"
                    value={repForm.issue}
                    onChange={(e) =>
                      setRepForm((f) => ({ ...f, issue: e.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Date Sent"
                    value={repForm.dateSent}
                    onChange={(e) =>
                      setRepForm((f) => ({ ...f, dateSent: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                <TextField
                  fullWidth
                  size="small"
                  label="Technician / Workshop"
                  placeholder="Name or facility"
                  value={repForm.tech}
                  onChange={(e) =>
                    setRepForm((f) => ({ ...f, tech: e.target.value }))
                  }
                  className="mb-4"
                />
                <Button
                  variant="contained"
                  onClick={addRepair}
                  className="normal-case font-semibold"
                  style={{ backgroundColor: C.primary }}
                  startIcon={<MdBuild />}
                >
                  Log Repair
                </Button>
              </CardContent>
            </Card>

            <Paper
              sx={{ width: "100%", overflow: "hidden" }}
              className="shadow-sm border border-slate-200"
            >
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Type</StyledTableCell>
                      <StyledTableCell align="center">Qty</StyledTableCell>
                      <StyledTableCell>Issue</StyledTableCell>
                      <StyledTableCell>Date Sent</StyledTableCell>
                      <StyledTableCell>Technician</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell align="center">Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ padding: 0 }}>
                          <LinearProgress />
                        </TableCell>
                      </TableRow>
                    )}
                    {repairs.map((r) => (
                      <TableRow
                        key={r.id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <StyledTableCell>
                          <span className="font-semibold">
                            {getType(r.typeId).name}
                          </span>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {r.qty}
                        </StyledTableCell>
                        <StyledTableCell>{r.issue}</StyledTableCell>
                        <StyledTableCell className="text-sm">
                          {fmtDate(r.dateSent)}
                        </StyledTableCell>
                        <StyledTableCell className="text-slate-500 text-sm">
                          {r.tech || "–"}
                        </StyledTableCell>
                        <StyledTableCell>
                          <StatusBadge
                            variant={
                              r.status === "in repair" ? "warning" : "success"
                            }
                          >
                            {r.status === "in repair"
                              ? "In Repair"
                              : "Completed"}
                          </StatusBadge>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {r.status === "in repair" && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => completeRepair(r.id)}
                              className="normal-case font-semibold text-xs"
                              style={{ backgroundColor: C.success }}
                              startIcon={<MdCheckCircle />}
                            >
                              Done
                            </Button>
                          )}
                        </StyledTableCell>
                      </TableRow>
                    ))}
                    {!repairs.length && !loading && (
                      <TableRow>
                        <StyledTableCell
                          colSpan={7}
                          className="text-center text-slate-400 py-8"
                        >
                          No repair records
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </TabPanel>

        {/* DAMAGED */}
        <TabPanel value={tab} index={4}>
          <div>
            <Card className="shadow-sm border border-slate-200 mb-6">
              <CardContent className="p-5">
                <div className="font-bold text-slate-800 mb-4">
                  Record Damaged Cylinder
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Cylinder Type"
                    value={dmgForm.typeId}
                    onChange={(e) =>
                      setDmgForm((f) => ({ ...f, typeId: e.target.value }))
                    }
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select type…</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Quantity"
                    value={dmgForm.qty}
                    onChange={(e) =>
                      setDmgForm((f) => ({ ...f, qty: e.target.value }))
                    }
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Damage Description"
                    placeholder="e.g. Dented body, cracked valve"
                    value={dmgForm.desc}
                    onChange={(e) =>
                      setDmgForm((f) => ({ ...f, desc: e.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Date Reported"
                    value={dmgForm.date}
                    onChange={(e) =>
                      setDmgForm((f) => ({ ...f, date: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                <Button
                  variant="contained"
                  onClick={addDamaged}
                  className="normal-case font-semibold"
                  style={{ backgroundColor: C.danger }}
                  startIcon={<MdWarning />}
                >
                  Record Damage
                </Button>
              </CardContent>
            </Card>

            <Paper
              sx={{ width: "100%", overflow: "hidden" }}
              className="shadow-sm border border-slate-200"
            >
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Type</StyledTableCell>
                      <StyledTableCell align="center">Qty</StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ padding: 0 }}>
                          <LinearProgress />
                        </TableCell>
                      </TableRow>
                    )}
                    {damaged.map((d) => (
                      <TableRow
                        key={d.id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <StyledTableCell>
                          <span className="font-semibold">
                            {getType(d.typeId).name}
                          </span>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {d.qty}
                        </StyledTableCell>
                        <StyledTableCell>{d.desc}</StyledTableCell>
                        <StyledTableCell className="text-sm">
                          {fmtDate(d.date)}
                        </StyledTableCell>
                        <StyledTableCell>
                          {d.action === "pending" && (
                            <StatusBadge variant="danger">Pending</StatusBadge>
                          )}
                          {d.action === "repair" && (
                            <StatusBadge variant="warning">
                              Sent to Repair
                            </StatusBadge>
                          )}
                          {d.action === "writeoff" && (
                            <StatusBadge variant="default">
                              Written Off
                            </StatusBadge>
                          )}
                        </StyledTableCell>
                        <StyledTableCell>
                          {d.action === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="small"
                                onClick={() => dmgAction(d.id, "repair")}
                                className="normal-case text-xs"
                                variant="outlined"
                                style={{
                                  borderColor: C.primary,
                                  color: C.primary,
                                }}
                                startIcon={<MdBuild />}
                              >
                                Repair
                              </Button>
                              <Button
                                size="small"
                                onClick={() => dmgAction(d.id, "writeoff")}
                                className="normal-case text-xs"
                                variant="outlined"
                                style={{
                                  borderColor: C.danger,
                                  color: C.danger,
                                }}
                                startIcon={<MdDelete />}
                              >
                                Write Off
                              </Button>
                            </div>
                          )}
                        </StyledTableCell>
                      </TableRow>
                    ))}
                    {!damaged.length && !loading && (
                      <TableRow>
                        <StyledTableCell
                          colSpan={6}
                          className="text-center text-slate-400 py-8"
                        >
                          No damage records
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
