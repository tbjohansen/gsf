import * as React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from "../../components/Badge";
import {
  capitalize,
  currencyFormatter,
  formatDateForDb,
  formatDateTimeForDb,
  formatter,
} from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import {
  MdAdd,
  MdArrowBack,
  MdSend,
  MdPending,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import {
  Autocomplete,
  TextField,
  Checkbox,
  IconButton,
  Button,
} from "@mui/material";
import DatePick from "../../components/DatePicker";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function PendingTransfers({ status }) {
  const [activeTab, setActiveTab] = React.useState(0);

  // Pending transfers state
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [pendingTransfers, setPendingTransfers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [item, setItem] = React.useState("");
  const [employee, setEmployee] = React.useState("");
  const [employees, setEmployees] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  // Received transfers state
  const [receivedPage, setReceivedPage] = React.useState(1);
  const [receivedRowsPerPage, setReceivedRowsPerPage] = React.useState(25);
  const [receivedTransfers, setReceivedTransfers] = React.useState([]);
  const [receivedLoading, setReceivedLoading] = React.useState(false);
  const [selectedReceived, setSelectedReceived] = React.useState(null);
  const [receivedStartDate, setReceivedStartDate] = React.useState(null);
  const [receivedEndDate, setReceivedEndDate] = React.useState(null);
  const [receivedItem, setReceivedItem] = React.useState("");
  const [receivedEmployee, setReceivedEmployee] = React.useState("");
  const [receivedPagination, setReceivedPagination] = React.useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  // Rejected transfers state
  const [rejectedPage, setRejectedPage] = React.useState(1);
  const [rejectedRowsPerPage, setRejectedRowsPerPage] = React.useState(25);
  const [rejectedTransfers, setRejectedTransfers] = React.useState([]);
  const [rejectedLoading, setRejectedLoading] = React.useState(false);
  const [selectedRejected, setSelectedRejected] = React.useState(null);
  const [rejectedStartDate, setRejectedStartDate] = React.useState(null);
  const [rejectedEndDate, setRejectedEndDate] = React.useState(null);
  const [rejectedItem, setRejectedItem] = React.useState("");
  const [rejectedEmployee, setRejectedEmployee] = React.useState("");
  const [rejectedPagination, setRejectedPagination] = React.useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();

  // Fetch pending transfers
  React.useEffect(() => {
    if (activeTab === 0) {
      loadPendingTransfers();
    }
  }, [startDate, endDate, item, employee, page, rowsPerPage, activeTab]);

  // Fetch received transfers
  React.useEffect(() => {
    if (activeTab === 1) {
      loadReceivedTransfers();
    }
  }, [
    receivedStartDate,
    receivedEndDate,
    receivedItem,
    receivedEmployee,
    receivedPage,
    receivedRowsPerPage,
    activeTab,
  ]);

  // Fetch rejected transfers
  React.useEffect(() => {
    if (activeTab === 2) {
      loadRejectedTransfers();
    }
  }, [
    rejectedStartDate,
    rejectedEndDate,
    rejectedItem,
    rejectedEmployee,
    rejectedPage,
    rejectedRowsPerPage,
    activeTab,
  ]);

  const loadPendingTransfers = async () => {
    setLoading(true);
    try {
      let url = `/oxygen/shifted-oxygen-item?&limit=${rowsPerPage}&page=${page}&Cache_Status=pending`;

      if (startDate) {
        url += `&Start_Date=${formatDateForDb(startDate)}`;
      }

      if (endDate) {
        url += `&End_Date=${formatDateForDb(endDate)}`;
      }

      if (item) {
        url += `&Item_ID=${item?.Item_ID}`;
      }

      if (employee) {
        url += `&Employee_ID=${employee?.Employee_ID}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        toast.error(
          response.data?.error || "Failed to fetch pending transfers",
        );
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch pending transfers");
        return;
      }

      const responseData = response?.data?.data;
      const userData = responseData?.data || [];

      const newData = userData?.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setPendingTransfers(Array.isArray(newData) ? newData : []);

      setPagination({
        total: responseData?.total || 0,
        perPage: responseData?.per_page || 25,
        currentPage: responseData?.current_page || 1,
        lastPage: responseData?.last_page || 1,
        from: responseData?.from || 0,
        to: responseData?.to || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error("Fetch pending transfers error:", error);
      setLoading(false);
      toast.error("Failed to load pending transfers");
    }
  };

  const loadReceivedTransfers = async () => {
    setReceivedLoading(true);
    try {
      let url = `/oxygen/shifted-oxygen-item?&limit=${receivedRowsPerPage}&page=${receivedPage}&Cache_Status=approved`;

      if (receivedStartDate) {
        url += `&Start_Date=${formatDateForDb(receivedStartDate)}`;
      }

      if (receivedEndDate) {
        url += `&End_Date=${formatDateForDb(receivedEndDate)}`;
      }

      if (receivedItem) {
        url += `&Item_ID=${receivedItem?.Item_ID}`;
      }

      if (receivedEmployee) {
        url += `&Employee_ID=${receivedEmployee?.Employee_ID}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setReceivedLoading(false);
        toast.error(
          response.data?.error || "Failed to fetch received transfers",
        );
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setReceivedLoading(false);
        toast.error(
          response.data.error || "Failed to fetch received transfers",
        );
        return;
      }

      const responseData = response?.data?.data;
      const userData = responseData?.data || [];

      const newData = userData?.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setReceivedTransfers(Array.isArray(newData) ? newData : []);

      setReceivedPagination({
        total: responseData?.total || 0,
        perPage: responseData?.per_page || 25,
        currentPage: responseData?.current_page || 1,
        lastPage: responseData?.last_page || 1,
        from: responseData?.from || 0,
        to: responseData?.to || 0,
      });

      setReceivedLoading(false);
    } catch (error) {
      console.error("Fetch received transfers error:", error);
      setReceivedLoading(false);
      toast.error("Failed to load received transfers");
    }
  };

  const loadRejectedTransfers = async () => {
    setRejectedLoading(true);
    try {
      let url = `/oxygen/shifted-oxygen-item?&limit=${rejectedRowsPerPage}&page=${rejectedPage}&Cache_Status=approved&Rejected=yes`;

      if (rejectedStartDate) {
        url += `&Start_Date=${formatDateForDb(rejectedStartDate)}`;
      }

      if (rejectedEndDate) {
        url += `&End_Date=${formatDateForDb(rejectedEndDate)}`;
      }

      if (rejectedItem) {
        url += `&Item_ID=${rejectedItem?.Item_ID}`;
      }

      if (rejectedEmployee) {
        url += `&Employee_ID=${rejectedEmployee?.Employee_ID}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setRejectedLoading(false);
        toast.error(
          response.data?.error || "Failed to fetch rejected transfers",
        );
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setRejectedLoading(false);
        toast.error(
          response.data.error || "Failed to fetch rejected transfers",
        );
        return;
      }

      const responseData = response?.data?.data;
      const userData = responseData?.data || [];

      const newData = userData?.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setRejectedTransfers(Array.isArray(newData) ? newData : []);

      setRejectedPagination({
        total: responseData?.total || 0,
        perPage: responseData?.per_page || 25,
        currentPage: responseData?.current_page || 1,
        lastPage: responseData?.last_page || 1,
        from: responseData?.from || 0,
        to: responseData?.to || 0,
      });

      setRejectedLoading(false);
    } catch (error) {
      console.error("Fetch rejected transfers error:", error);
      setRejectedLoading(false);
      toast.error("Failed to load rejected transfers");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const itemOnChange = (e, value) => {
    setItem(value);
  };

  const employeeOnChange = (e, value) => {
    setEmployee(value);
  };

  const receivedItemOnChange = (e, value) => {
    setReceivedItem(value);
  };

  const receivedEmployeeOnChange = (e, value) => {
    setReceivedEmployee(value);
  };

  const rejectedItemOnChange = (e, value) => {
    setRejectedItem(value);
  };

  const rejectedEmployeeOnChange = (e, value) => {
    setRejectedEmployee(value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 25);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleReceivedChangePage = (event, newPage) => {
    setReceivedPage(newPage + 1);
  };

  const handleReceivedChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 25);
    setReceivedRowsPerPage(newRowsPerPage);
    setReceivedPage(1);
  };

  const handleRejectedChangePage = (event, newPage) => {
    setRejectedPage(newPage + 1);
  };

  const handleRejectedChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 25);
    setRejectedRowsPerPage(newRowsPerPage);
    setRejectedPage(1);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
  };

  const handleReceivedClick = (row) => {
    setSelectedReceived(row);
  };

  const handleRejectedClick = (row) => {
    setSelectedRejected(row);
  };

  const loadItems = async () => {
    try {
      const response = await apiClient.get(`/settings/item?Item_Type=oxygen`);

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const itemData = response?.data?.data;
      const newData = itemData?.map((item, index) => ({
        id: item.Item_ID,
        label: item.Item_Name,
        key: index + 1,
        ...item,
      }));
      setItems(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiClient.get(`/employee`);

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const employeeData = response?.data?.data;
      const newData = employeeData?.map((employee, index) => ({
        id: employee.Employee_ID,
        label: employee.name,
        key: index + 1,
        ...employee,
      }));
      setEmployees(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch employees error:", error);
    }
  };

  React.useEffect(() => {
    loadItems();
    loadEmployees();
  }, []);

  const columns = React.useMemo(() => {
    return [
      { id: "key", label: "S/N" },
      {
        id: "ShiftedItem",
        label: "Transferred Items (Units)",
        format: (value, row) => {
          if (!row.ShiftedItem || !Array.isArray(row.ShiftedItem)) {
            return <span className="text-gray-400">No items</span>;
          }

          return (
            <div className="flex flex-col">
              <div className="text-sm">
                {row?.ShiftedItem?.map((prodItem, idx) => (
                  <div key={idx}>
                    • {prodItem?.item?.Item_Name}:{" "}
                    {formatter.format(Number(prodItem?.Shifted_Balance))}
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: "Transaction_Date",
        label: "Transferred Date",
        format: (value) => <span>{formatDateForDb(value)}</span>,
      },
      {
        id: "employees",
        label: "Transferred By",
        minWidth: 180,
        format: (row, value) => (
          <span>{capitalize(value?.employee?.name)}</span>
        ),
      },
      {
        id: "created_at",
        label: "Created At",
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
    ];
  }, []);

    const rejectedColumns = React.useMemo(() => {
    return [
      { id: "key", label: "S/N" },
      {
        id: "ShiftedItem",
        label: "Rejected Items (Units)",
        format: (value, row) => {
          if (!row.ShiftedItem || !Array.isArray(row.ShiftedItem)) {
            return <span className="text-gray-400">No items</span>;
          }

          return (
            <div className="flex flex-col">
              <div className="text-sm">
                {row?.ShiftedItem?.map((prodItem, idx) => (
                  <div key={idx}>
                    • {prodItem?.item?.Item_Name}:{" "}
                    {formatter.format(Number(prodItem?.Shifted_Balance || 0)) - formatter.format(Number(prodItem?.Sales_Accepted_Quantity || 0))}
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: "Transaction_Date",
        label: "Transferred Date",
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      {
        id: "Rejected_Time",
        label: "Rejected Date",
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      {
        id: "rejected_employee",
        label: "Rejected By",
        minWidth: 180,
        format: (row, value) => (
          <span>{capitalize(value?.employee?.name)}</span>
        ),
      },
      {
        id: "created_at",
        label: "Created At",
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
    ];
  }, []);

  const transfersColumns = React.useMemo(() => {
    return [
      { id: "key", label: "S/N" },
      {
        id: "Transaction_Date",
        label: "Transfer Date",
        minWidth: 180,
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      {
        id: "ShiftedItem",
        label: "Transferred Items (Units)",
        minWidth: 250,
        format: (value, row) => {
          if (!row.ShiftedItem || !Array.isArray(row.ShiftedItem)) {
            return <span className="text-gray-400">No items</span>;
          }

          return (
            <div className="flex flex-col">
              <div className="text-sm">
                {row?.ShiftedItem?.map((prodItem, idx) => (
                  <div key={idx}>
                    • {prodItem.item?.Item_Name}:{" "}
                    {formatter.format(Number(prodItem.Shifted_Balance))}
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: "ReceivedItem",
        label: "Received Items (Units)",
        minWidth: 250,
        format: (value, row) => {
          if (!row.ShiftedItem || !Array.isArray(row.ShiftedItem)) {
            return <span className="text-gray-400">No items</span>;
          }

          return (
            <div className="flex flex-col">
              <div className="text-sm">
                {row?.ShiftedItem?.map((prodItem, idx) => (
                  <div key={idx}>
                    • {prodItem.item?.Item_Name}:{" "}
                    {formatter.format(Number(prodItem?.Sales_Accepted_Quantity))}
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: "Cache_Status",
        label: "Status",
        format: (value) => (
          <span>
            <Badge
              name={capitalize(value)}
              color={value === "approved" ? "green" : "blue"}
            />
          </span>
        ),
      },
      {
        id: "employees",
        label: "Transferred By",
        minWidth: 180,
        format: (row, value) => (
          <span>{capitalize(value?.employee?.name)}</span>
        ),
      },
      {
        id: "Approved_Date",
        label: "Received Date",
        minWidth: 180,
        format: (value) => (
          <span>{value ? formatDateTimeForDb(value) : null}</span>
        ),
      },
      {
        id: "Sales_Remarks",
        label: "Sales Remarks",
        minWidth: 200,
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "Production_Remarks",
        label: "Production Remarks",
        minWidth: 200,
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "created_at",
        label: "Created At",
        minWidth: 150,
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
    ];
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge color="warning" text="Pending" />;
      case "received":
        return <Badge color="success" text="Received" />;
      case "rejected":
        return <Badge color="error" text="Rejected" />;
      default:
        return <Badge color="default" text={status} />;
    }
  };

  return (
    <>
      <Breadcrumb />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <IconButton
              onClick={() => navigate(-1)}
              className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <MdArrowBack />
            </IconButton>
            <div>
              <h1 className="font-bold text-gray-800">
                Oxygen Transfers Management
              </h1>
              <p className="text-gray-500 text-xs mt-1">
                Manage pending, received, and rejected transfers
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {activeTab === 0 && (
              <Button
                variant="contained"
                startIcon={<MdAdd />}
                onClick={() =>
                  navigate("/projects/oxygen/pending-transfers/receive")
                }
                sx={{
                  backgroundColor: "#1F4389",
                  "&:hover": { backgroundColor: "#07286f" },
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  px: 3,
                }}
              >
                Receive Productions
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full border-b border-gray-200 mb-4">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="transfer status tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 48,
            },
          }}
        >
          <Tab
            label="Pending Transfers"
            icon={<MdPending />}
            iconPosition="start"
          />
          <Tab
            label="Received Transfers"
            icon={<MdCheckCircle />}
            iconPosition="start"
          />
          <Tab
            label="Rejected Transfers"
            icon={<MdCancel />}
            iconPosition="start"
          />
        </Tabs>
      </div>

      {/* Pending Transfers Tab */}
      {activeTab === 0 && (
        <>
          <div className="w-full py-2 flex gap-2 mb-1">
            <DatePick
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              className="w-[25%]"
            />
            <DatePick
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              className="w-[25%]"
            />
            <Autocomplete
              id="item-select"
              options={items}
              size="small"
              freeSolo
              className="w-[25%]"
              value={item}
              onChange={itemOnChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Item" />
              )}
            />
            <Autocomplete
              id="employee-select"
              options={employees}
              size="small"
              freeSolo
              className="w-[25%]"
              value={employee}
              onChange={employeeOnChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Employee" />
              )}
            />
          </div>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="pending transfers table">
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
                      <TableCell
                        colSpan={columns.length + 1}
                        sx={{ padding: 0 }}
                      >
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {pendingTransfers?.map((row) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.key || row.id}
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
                        {columns
                          .filter(
                            (e) => typeof e.show === "undefined" || !!e.show,
                          )
                          .map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell
                                key={column.id}
                                align={column.align}
                                onClick={(e) => {
                                  if (column.id === "actions") {
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                {column.format
                                  ? column.format(value, row, handleRowClick)
                                  : value}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    );
                  })}
                  {!loading && pendingTransfers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} align="center">
                        <div className="py-8 text-gray-500">
                          No pending transfers found
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100, 500, 1000]}
              component="div"
              count={pagination.total}
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
      )}

      {/* Received Transfers Tab */}
      {activeTab === 1 && (
        <>
          <div className="w-full py-2 flex gap-2 mb-1">
            <DatePick
              label="Start Date"
              value={receivedStartDate}
              onChange={(newValue) => setReceivedStartDate(newValue)}
              className="w-[25%]"
            />
            <DatePick
              label="End Date"
              value={receivedEndDate}
              onChange={(newValue) => setReceivedEndDate(newValue)}
              className="w-[25%]"
            />
            <Autocomplete
              id="received-item-select"
              options={items}
              size="small"
              freeSolo
              className="w-[25%]"
              value={receivedItem}
              onChange={receivedItemOnChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Item" />
              )}
            />
            <Autocomplete
              id="received-employee-select"
              options={employees}
              size="small"
              freeSolo
              className="w-[25%]"
              value={receivedEmployee}
              onChange={receivedEmployeeOnChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Employee" />
              )}
            />
          </div>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="received transfers table">
                <TableHead>
                  <TableRow>
                    {transfersColumns.map((column) => (
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
                  {receivedLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={transfersColumns.length + 1}
                        sx={{ padding: 0 }}
                      >
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {receivedTransfers?.map((row) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.key || row.id}
                        onClick={() => handleReceivedClick(row)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedReceived?.key === row.key
                              ? "rgba(0, 0, 0, 0.04)"
                              : "inherit",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.08)",
                          },
                        }}
                      >
                        {transfersColumns
                          .filter(
                            (e) => typeof e.show === "undefined" || !!e.show,
                          )
                          .map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell
                                key={column.id}
                                align={column.align}
                                onClick={(e) => {
                                  if (column.id === "actions") {
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                {column.format
                                  ? column.format(
                                      value,
                                      row,
                                      handleReceivedClick,
                                    )
                                  : value}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    );
                  })}
                  {!receivedLoading && receivedTransfers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={transfersColumns.length + 1}
                        align="center"
                      >
                        <div className="py-8 text-gray-500">
                          No received transfers found
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100, 500, 1000]}
              component="div"
              count={receivedPagination.total}
              rowsPerPage={receivedRowsPerPage}
              page={receivedPage - 1}
              onPageChange={handleReceivedChangePage}
              onRowsPerPageChange={handleReceivedChangeRowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} of ${count}`
              }
              showFirstButton
              showLastButton
            />
          </Paper>
        </>
      )}

      {/* Rejected Transfers Tab */}
      {activeTab === 2 && (
        <>
          <div className="w-full py-2 flex gap-2 mb-1">
            <DatePick
              label="Start Date"
              value={rejectedStartDate}
              onChange={(newValue) => setRejectedStartDate(newValue)}
              className="w-[25%]"
            />
            <DatePick
              label="End Date"
              value={rejectedEndDate}
              onChange={(newValue) => setRejectedEndDate(newValue)}
              className="w-[25%]"
            />
            <Autocomplete
              id="rejected-item-select"
              options={items}
              size="small"
              freeSolo
              className="w-[25%]"
              value={rejectedItem}
              onChange={rejectedItemOnChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Item" />
              )}
            />
            <Autocomplete
              id="rejected-employee-select"
              options={employees}
              size="small"
              freeSolo
              className="w-[25%]"
              value={rejectedEmployee}
              onChange={rejectedEmployeeOnChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Employee" />
              )}
            />
          </div>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="rejected transfers table">
                <TableHead>
                  <TableRow>
                    {rejectedColumns.map((column) => (
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
                  {rejectedLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={rejectedColumns.length + 1}
                        sx={{ padding: 0 }}
                      >
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {rejectedTransfers?.map((row) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.key || row.id}
                        onClick={() => handleRejectedClick(row)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedRejected?.key === row.key
                              ? "rgba(0, 0, 0, 0.04)"
                              : "inherit",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.08)",
                          },
                        }}
                      >
                        {rejectedColumns
                          .filter(
                            (e) => typeof e.show === "undefined" || !!e.show,
                          )
                          .map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell
                                key={column.id}
                                align={column.align}
                                onClick={(e) => {
                                  if (column.id === "actions") {
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                {column.format
                                  ? column.format(
                                      value,
                                      row,
                                      handleRejectedClick,
                                    )
                                  : value}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    );
                  })}
                  {!rejectedLoading && rejectedTransfers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={rejectedColumns.length + 1} align="center">
                        <div className="py-8 text-gray-500">
                          No rejected transfers found
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100, 500, 1000]}
              component="div"
              count={rejectedPagination.total}
              rowsPerPage={rejectedRowsPerPage}
              page={rejectedPage - 1}
              onPageChange={handleRejectedChangePage}
              onRowsPerPageChange={handleRejectedChangeRowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} of ${count}`
              }
              showFirstButton
              showLastButton
            />
          </Paper>
        </>
      )}
    </>
  );
}
