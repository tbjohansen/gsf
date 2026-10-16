import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import LinearProgress from "@mui/material/LinearProgress";
import {
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
  Autocomplete,
} from "@mui/material";
import { MdArrowBack, MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { capitalize } from "lodash";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Badge from "../../components/Badge";
import Breadcrumb from "../../components/Breadcrumb";
import apiClient from "../../api/Client";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const SEARCH_DEBOUNCE_MS = 500;
const MAX_RETRIES = 3;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getWithRetry = async (url) => {
  for (let attempt = 0; ; attempt++) {
    const response = await apiClient.get(url);
    if (response?.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(response.headers?.["retry-after"]);
      await sleep(
        retryAfter
          ? retryAfter * 1000
          : 800 * 2 ** attempt + Math.random() * 300,
      );
      continue;
    }
    return response;
  }
};

const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

// ---- Column definitions (rooms) ----
const columns = [
  {
    id: "room_name",
    label: "Room Name",
    minWidth: 140,
    format: (_, row) => <span className="font-medium">{row?.Room_Name}</span>,
  },
  {
    id: "room_type",
    label: "Type",
    minWidth: 110,
    format: (_, row) => <span>{capitalize(row?.Room_Type || "-")}</span>,
  },
  {
    id: "no_bed",
    label: "Beds",
    minWidth: 90,
    format: (_, row) => <span>{row?.No_Bed ?? 0}</span>,
  },
  {
    id: "hostel",
    label: "Hostel",
    minWidth: 150,
    format: (_, row) => <span>{row?.hostel?.Hostel_Name || "-"}</span>,
  },
  {
    id: "block",
    label: "Block",
    minWidth: 120,
    format: (_, row) => <span>{row?.block?.Block_Name || "-"}</span>,
  },
  {
    id: "flow",
    label: "Floor",
    minWidth: 130,
    format: (_, row) => <span>{row?.flow?.Flow_Name || "-"}</span>,
  },
  {
    id: "occupants",
    label: "Occupants",
    minWidth: 130,
    format: (_, row) => {
      const count = row?.students?.length || 0;
      const beds = row?.No_Bed || 0;
      const full = count >= beds && beds > 0;
      return (
        <Chip
          size="small"
          label={`${count} / ${beds}`}
          color={full ? "error" : count > 0 ? "success" : "default"}
          variant={count > 0 ? "filled" : "outlined"}
        />
      );
    },
  },
  {
    id: "remaining",
    label: "Remaining Beds",
    minWidth: 140,
    format: (_, row) => {
      const remaining = Math.max(
        0,
        (row?.No_Bed || 0) - (row?.students?.length || 0),
      );
      return (
        <Chip
          size="small"
          label={remaining}
          color={remaining === 0 ? "error" : "primary"}
          variant={remaining === 0 ? "filled" : "outlined"}
        />
      );
    },
  },
  {
    id: "Room_Status",
    label: "Status",
    minWidth: 110,
    format: (value) => (
      <Badge
        name={capitalize(value || "unknown")}
        color={value === "active" ? "green" : "error"}
      />
    ),
  },
];

// ---- Plain-text column config used for exports ----
const exportColumns = [
  { header: "Room Name", key: "room_name" },
  { header: "Type", key: "room_type" },
  { header: "Beds", key: "beds" },
  { header: "Hostel", key: "hostel" },
  { header: "Block", key: "block" },
  { header: "Floor", key: "floor" },
  { header: "Occupants", key: "occupants" },
  { header: "Remaining Beds", key: "remaining" },
  { header: "Status", key: "status" },
];

// ---- Convert a room row into a flat, exportable object ----
const roomToExportRow = (row) => {
  const occupants = row?.students?.length || 0;
  const beds = row?.No_Bed || 0;
  return {
    room_name: row?.Room_Name || "-",
    room_type: capitalize(row?.Room_Type || "-"),
    beds,
    hostel: row?.hostel?.Hostel_Name || "-",
    block: row?.block?.Block_Name || "-",
    floor: row?.flow?.Flow_Name || "-",
    occupants,
    remaining: Math.max(0, beds - occupants),
    status: capitalize(row?.Room_Status || "unknown"),
  };
};

// ---- CSV export ----
const exportToCSV = (rows, filename = "rooms-statistics.csv") => {
  if (!rows.length) {
    toast.error("No data to export");
    return;
  }
  const header = exportColumns.map((c) => `"${c.header}"`).join(",");
  const body = rows
    .map((row) =>
      exportColumns
        .map((c) => {
          const val = row[c.key];
          const str = val === null || val === undefined ? "" : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\n");

  const csvContent = `\uFEFF${header}\n${body}`; // BOM for Excel unicode
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ---- Excel export ----
const exportToExcel = (rows, filename = "rooms-statistics.xlsx") => {
  if (!rows.length) {
    toast.error("No data to export");
    return;
  }
  const data = rows.map((row) => {
    const obj = {};
    exportColumns.forEach((c) => {
      obj[c.header] = row[c.key];
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rooms");
  XLSX.writeFile(workbook, filename);
};

// ---- PDF export ----
const exportToPDF = (rows, filename = "rooms-statistics.pdf") => {
  if (!rows.length) {
    toast.error("No data to export");
    return;
  }
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFontSize(14);
  doc.text("Rooms Statistics", 40, 40);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

  autoTable(doc, {
    startY: 75,
    head: [exportColumns.map((c) => c.header)],
    body: rows.map((row) => exportColumns.map((c) => row[c.key])),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [63, 81, 181], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 246, 250] },
    margin: { left: 40, right: 40 },
  });

  doc.save(filename);
};

export default function RoomsOccupants() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [hostel, setHostel] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Modal state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const latestRequestId = useRef(0);
  const navigate = useNavigate();

  const debouncedRoomName = useDebouncedValue(
    roomName.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  // ---- Sorted hostels for Autocomplete ----
  const sortedHostels = useMemo(
    () =>
      [...hostels].sort((a, b) =>
        (a?.Hostel_Name || "").localeCompare(b?.Hostel_Name || ""),
      ),
    [hostels],
  );

  // ---- Fetch hostels list ----
  const loadHostels = useCallback(async () => {
    try {
      const response = await apiClient.get("/settings/hostel");

      if (!response.ok) {
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          const serverMessage =
            response?.data?.error || response?.data?.message;
          toast.error(
            typeof serverMessage === "string"
              ? serverMessage
              : "Failed to fetch hostel",
          );
        }
        return;
      }

      const hostelData = response?.data?.data;
      const newData = hostelData?.map((h, index) => ({
        ...h,
        key: index + 1,
      }));
      setHostels(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch hostels error:", error);
      toast.error("Failed to load hostels");
    }
  }, []);

  useEffect(() => {
    loadHostels();
  }, [loadHostels]);

  // Reset page whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedRoomName, hostel]);

  const url = useMemo(() => {
    const params = new URLSearchParams({
      limit: String(rowsPerPage),
      page: String(page),
    });

    if (debouncedRoomName) {
      params.set("room_name", debouncedRoomName);
    }

    if (hostel?.Hostel_ID) {
      params.set("hostel_ID", String(hostel.Hostel_ID));
    }

    return `/room-statistics?${params.toString()}`;
  }, [debouncedRoomName, hostel, rowsPerPage, page]);

  const loadData = useCallback(async (requestUrl) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const response = await getWithRetry(requestUrl);
      if (requestId !== latestRequestId.current) return;

      if (!response.ok || response.data?.error || response.data?.code >= 400) {
        toast.error(response.data?.error || "Failed to fetch rooms");
        return;
      }

      // Handle both paginated and plain-array responses
      const responseData = response?.data?.data;
      const rows = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
          ? responseData
          : [];

      setRooms(rows);
      setTotal(responseData?.total ?? rows.length);
    } catch (error) {
      if (requestId !== latestRequestId.current) return;
      console.error("Fetch rooms error:", error);
      toast.error("Failed to fetch rooms");
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(url);
  }, [url, loadData]);

  const handleChangePage = (_, newPage) => setPage(newPage + 1);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRoom(null);
  };

  // ---- Export handlers (exports currently loaded rooms) ----
  const exportRows = useMemo(() => rooms.map(roomToExportRow), [rooms]);

  const handleExportExcel = () => {
    if (exportRows.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToExcel(exportRows);
    toast.success("Excel downloaded");
  };

  const handleExportCSV = () => {
    if (exportRows.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToCSV(exportRows);
    toast.success("CSV downloaded");
  };

  const handleExportPDF = () => {
    if (exportRows.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToPDF(exportRows);
    toast.success("PDF downloaded");
  };

  const students = selectedRoom?.students || [];
  const beds = selectedRoom?.No_Bed || 0;
  const remaining = Math.max(0, beds - students.length);

  return (
    <>
      <Breadcrumb />
      <div className="w-full">
        <div className="flex flex-row gap-4 mb-1">
          <IconButton
            onClick={() => navigate(-1)}
            className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <MdArrowBack />
          </IconButton>
          <h4 className="my-2">Rooms Statistics</h4>
        </div>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1 flex-wrap">
        <TextField
          size="small"
          label="Room Name"
          variant="outlined"
          className="flex-1 min-w-[200px]"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          autoFocus
        />
        <Autocomplete
          id="hostel-filter"
          options={sortedHostels}
          size="small"
          freeSolo
          className="flex-1 min-w-[200px]"
          value={hostel}
          onChange={(_, newValue) => setHostel(newValue)}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option?.Hostel_Name || ""
          }
          isOptionEqualToValue={(option, value) =>
            option?.Hostel_ID === value?.Hostel_ID
          }
          renderInput={(params) => (
            <TextField {...params} label="Select Hostel" />
          )}
        />

        <Button
          variant="contained"
          color="success"
          onClick={handleExportExcel}
          disabled={loading || rooms.length === 0}
        >
          Excel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportCSV}
          disabled={loading || rooms.length === 0}
        >
          CSV
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleExportPDF}
          disabled={loading || rooms.length === 0}
        >
          PDF
        </Button>
      </div>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <StyledTableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ padding: 0 }}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              )}

              {!loading && rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No rooms found.
                  </TableCell>
                </TableRow>
              )}

              {rooms.map((row) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={row.Room_ID}
                  onClick={() => handleRoomClick(row)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100, 1000]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count}`
          }
          showFirstButton
          showLastButton
        />
      </Paper>

      {/* ---- Occupants Modal ---- */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div className="font-semibold">
              {selectedRoom?.Room_Name} — Occupants
            </div>
            <div className="text-xs text-slate-500 font-normal mt-1">
              {selectedRoom?.hostel?.Hostel_Name} ·{" "}
              {selectedRoom?.block?.Block_Name} ·{" "}
              {selectedRoom?.flow?.Flow_Name}
            </div>
          </div>
          <IconButton onClick={handleCloseModal} size="small">
            <MdClose />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <div className="flex gap-3 mb-4">
            <Chip
              size="small"
              label={`Beds: ${beds}`}
              color="default"
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Occupants: ${students.length}`}
              color={students.length > 0 ? "success" : "default"}
            />
            <Chip
              size="small"
              label={`Remaining Beds: ${remaining}`}
              color={remaining === 0 ? "error" : "primary"}
            />
          </div>

          {students.length === 0 ? (
            <div className="text-center text-slate-500 py-6">
              No students assigned to this room yet.
              <div className="mt-2 text-sm">
                {remaining} bed{remaining !== 1 ? "s" : ""} available.
              </div>
            </div>
          ) : (
            <Table size="large">
              <TableHead>
                <TableRow>
                  <StyledTableCell>#</StyledTableCell>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Student ID</StyledTableCell>
                  <StyledTableCell>Phone</StyledTableCell>
                  <StyledTableCell>Sangira</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                  <StyledTableCell>Requested Date</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students?.map((student, index) => (
                  <TableRow key={student.Customer_ID ?? index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student?.Customer_Name || "-"}</TableCell>
                    <TableCell>
                      {student?.Student_ID || student?.Admission_ID || "-"}
                    </TableCell>
                    <TableCell>{student?.Phone_Number || "-"}</TableCell>
                    <TableCell>
                      {student.sangira?.Sangira_Number || "-"}
                    </TableCell>
                    <TableCell>
                      {student.sangira?.Grand_Total_Price || "-"}
                    </TableCell>
                    <TableCell>
                      {student.sangira?.Requested_Date || "-"}
                    </TableCell>
                    <TableCell>
                      {student.sangira?.Sangira_Status || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}