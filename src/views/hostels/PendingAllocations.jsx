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
import { formatDateTimeForDb } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import { capitalize } from "lodash";
import Badge from "../../components/Badge";
import Breadcrumb from "../../components/Breadcrumb";
import { IconButton, TextField } from "@mui/material";
import { MdArrowBack } from "react-icons/md";

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

// GET with retry + exponential backoff on 429 (honours Retry-After header)
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

// Returns `value` only after it has stopped changing for `delay` ms
const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

// Columns don't depend on component state, so define them once
const columns = [
  { id: "key", label: "S/N" },
  {
    id: "name",
    label: "Student Name",
    minWidth: 170,
    format: (_, row) => <div>{row?.customer?.Customer_Name}</div>,
  },
  {
    id: "Gender",
    label: "Gender",
    format: (_, row) => <span>{capitalize(row?.customer?.Gender)}</span>,
  },
  {
    id: "Phone_Number",
    label: "Phone",
    format: (_, row) => <span>{row?.customer?.Phone_Number}</span>,
  },
  {
    id: "Email",
    label: "Email",
    format: (_, row) => <span>{row?.customer?.Email}</span>,
  },
  {
    id: "Student_ID",
    label: "Student ID",
    minWidth: 170,
    format: (_, row) => (
      <span>{row?.customer?.Student_ID || row?.customer?.Admission_ID}</span>
    ),
  },
  {
    id: "Program_Study",
    label: "Program",
    format: (_, row) => <span>{row?.customer?.Program_Study}</span>,
  },
  {
    id: "Year_Study",
    label: "Year",
    format: (_, row) => <span>{row?.customer?.Year_Study}</span>,
  },
  {
    id: "Semester",
    label: "Semester",
    format: (_, row) => <span>{row?.customer?.Semester}</span>,
  },
  {
    id: "Customer_Status",
    label: "Status",
    format: (value) => (
      <Badge
        name={capitalize(value)}
        color={value === "paid" ? "green" : "error"}
      />
    ),
  },
  {
    id: "hostel",
    label: "Hostel",
    minWidth: 170,
    format: (_, row) => <span>{row?.room?.hostel?.Hostel_Name}</span>,
  },
  {
    id: "created_at",
    label: "Created At",
    minWidth: 170,
    format: (value) => <span>{formatDateTimeForDb(value)}</span>,
  },
].filter((column) => typeof column.show === "undefined" || !!column.show);

export default function PendingAllocations() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [total, setTotal] = useState(0);

  const latestRequestId = useRef(0);
  const navigate = useNavigate();

  // Only search once the user pauses typing
  const debouncedName = useDebouncedValue(name.trim(), SEARCH_DEBOUNCE_MS);
  const debouncedCustomerID = useDebouncedValue(
    customerID.trim(),
    SEARCH_DEBOUNCE_MS,
  );
  const debouncedPhone = useDebouncedValue(
    phoneNumber.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  // New search -> back to first page (avoids an extra request for a page that may not exist)
  useEffect(() => {
    setPage(1);
  }, [debouncedName, debouncedCustomerID, debouncedPhone]);

  const url = useMemo(() => {
    const params = new URLSearchParams({
      Customer_Status: "paid",
      Room_Status: "paid",
      Request_Type: "hostel",
      item_type: "student_accomodatio",
      limit: String(rowsPerPage),
      page: String(page),
    });
    if (debouncedName) params.set("Customer_Name", debouncedName);
    if (debouncedCustomerID) params.set("Student_ID", debouncedCustomerID);
    if (debouncedPhone) params.set("Phone_Number", debouncedPhone);
    return `/customer/customer-request?${params.toString()}`;
  }, [debouncedName, debouncedCustomerID, debouncedPhone, rowsPerPage, page]);

  const loadData = useCallback(async (requestUrl) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const response = await getWithRetry(requestUrl);

      // A newer request has started; ignore this stale response
      if (requestId !== latestRequestId.current) return;

      if (!response.ok || response.data?.error || response.data?.code >= 400) {
        toast.error(response.data?.error || "Failed to fetch students");
        return;
      }

      const responseData = response?.data?.data;
      const rows = Array.isArray(responseData?.data) ? responseData.data : [];
      const offset =
        ((responseData?.current_page || 1) - 1) *
        (responseData?.per_page || rows.length);

      setUsers(
        rows.map((user, index) => ({ ...user, key: offset + index + 1 })),
      );
      setTotal(responseData?.total || 0);
    } catch (error) {
      if (requestId !== latestRequestId.current) return;
      console.error("Fetch customers error:", error);
      toast.error("Failed to fetch students");
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(url);
  }, [url, loadData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    navigate(
      `/projects/hostels/pending-room-assignments/${row?.Request_ID}/assign-room`,
    );
  };

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
          <h4 className="my-2">Pending Room Assignments</h4>
        </div>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <TextField
          size="small"
          id="search-name"
          label="Name"
          variant="outlined"
          className="w-[33%]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <TextField
          size="small"
          id="search-student-id"
          label="Student ID"
          variant="outlined"
          className="w-[33%]"
          value={customerID}
          onChange={(e) => setCustomerID(e.target.value)}
        />
        <TextField
          size="small"
          id="search-phone"
          label="Phone Number"
          variant="outlined"
          className="w-[33%]"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
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
              {users.map((row) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={row.Request_ID ?? row.key}
                  onClick={() => handleRowClick(row)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedRow?.key === row.key
                        ? "rgba(0, 0, 0, 0.04)"
                        : "inherit",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        onClick={(e) => {
                          // Don't trigger row navigation from action buttons
                          if (column.id === "actions") e.stopPropagation();
                        }}
                      >
                        {column.format
                          ? column.format(value, row, handleRowClick)
                          : value}
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
    </>
  );
}
