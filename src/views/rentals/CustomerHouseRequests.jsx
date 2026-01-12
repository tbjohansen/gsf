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
import { MdAdd, MdSend } from "react-icons/md";
import { Autocomplete, TextField, Checkbox, Button } from "@mui/material";
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

export default function CustomerHouseRequests({ status }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [requestingBatch, setRequestingBatch] = React.useState(null);

  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [item, setItem] = React.useState("");

  const [customers, setCustomers] = React.useState([]);
  const [items, setItems] = React.useState([]);

  const employeeData = localStorage.getItem("userInfo");
  const employee = JSON.parse(employeeData);
  const customer = employee?.customer;

  const navigate = useNavigate();

  // Load customers and items on mount
  React.useEffect(() => {
    loadCustomers();
    loadItems();
  }, []);

  // Fetch requests from API
  React.useEffect(() => {
    loadData();
  }, [startDate, endDate, item]);

  const loadCustomers = async () => {
    try {
      const response = await apiClient.get(
        `/customer/customer?Customer_Nature=oxygen&limit=100&page=1`
      );

      if (response.ok && !response.data?.error) {
        const customerData =
          response?.data?.data?.data || response?.data?.data || [];
        const formattedCustomers = customerData.map((cust) => ({
          ...cust,
          label: cust.Customer_Name,
        }));
        setCustomers(
          Array.isArray(formattedCustomers) ? formattedCustomers : []
        );
      }
    } catch (error) {
      console.error("Fetch customers error:", error);
    }
  };

  const loadItems = async () => {
    try {
      const response = await apiClient.get(`/settings/item?Item_Type=oxygen`);

      if (response.ok && !response.data?.error) {
        const itemData = response?.data?.data || [];
        const formattedItems = itemData.map((itm) => ({
          ...itm,
          label: itm.Item_Name,
        }));
        setItems(Array.isArray(formattedItems) ? formattedItems : []);
      }
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Customer_ID=${customer?.Customer_ID}&Request_Type=real_estate&Customer_Status=active`;

      if (startDate) {
        url += `&Start_Date=${formatDateForDb(startDate)}`;
      }

      if (endDate) {
        url += `&End_Date=${formatDateForDb(endDate)}`;
      }

      if (item) {
        url += `&Item_ID=${item?.Item_ID}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch customer requests");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch customer requests");
        return;
      }

      const itemData = response?.data?.data?.data;
      const newData = itemData?.map((item, index) => ({
        ...item,
        key: index + 1,
      }));
      setRequests(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch customer requests error:", error);
      setLoading(false);
      toast.error("Failed to load customer requests");
    }
  };

  const itemOnChange = (e, value) => {
    setItem(value);
  };

  const handleRequestSangiraForBatch = async (row) => {
    if (!row.request || row.request.length === 0) {
      toast.error("No items to request Sangira number for");
      return;
    }

    try {
      setRequestingBatch(row.Request_Batch_ID);

      // Calculate grand total
      const grandTotal = row.request.reduce(
        (sum, item) => sum + item.Price * item.Quantity,
        0
      );

      // Collect all Request_IDs from the batch
      const requestIds = row.request.map((item) => item.Request_ID);

      const payload = {
        Employee_ID: row.Employee_ID,
        Request_ID: requestIds,
        Customer_ID: row.Customer_ID,
        Phone_Number:
          row.customer?.Phone_Number || customer?.Phone_Number || "",
        Customer_Name:
          row.customer?.Customer_Name || customer?.Customer_Name || "",
        Grand_Total_Price: grandTotal,
      };

      const response = await apiClient.post(
        "/oxygen/request-sangira-number",
        payload
      );

      if (!response.ok || response.data?.error || response.data?.code >= 400) {
        setRequestingBatch(null);
        toast.error(response.data?.error || "Failed to request Sangira number");
        return;
      }

      toast.success("Sangira number requested successfully!");

      // Reload data to get updated information
      await loadData();
      setRequestingBatch(null);
    } catch (error) {
      console.error("Request Sangira error:", error);
      setRequestingBatch(null);
      toast.error("Failed to request Sangira number");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
  };

  const columns = React.useMemo(() => {
    return [
      { id: "key", label: "S/N" },
      {
        id: "Request_Batch_ID",
        label: "Request ID",
        minWidth: 110,
      },
      {
        id: "request_items",
        label: "Unit",
        minWidth: 300,
        format: (value, row) => {
          if (!row.request || !Array.isArray(row.request)) {
            return <span className="text-gray-400">No items</span>;
          }

          return (
            <div className="flex flex-col gap-2">
              {row.request.map((reqItem, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    • {reqItem?.item?.Item_Name}
                  </span>
                  <span className="text-gray-600">
                    ({formatter.format(Number(reqItem?.Quantity))} units )
                  </span>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        id: "total_amount",
        label: "Amount",
        format: (value, row) => {
          if (!row.request || !Array.isArray(row.request)) {
            return formatter.format(0);
          }

          const total = row.request.reduce(
            (sum, item) => sum + item.Price * item.Quantity,
            0
          );
          return (
            <span className="font-semibold">
              {currencyFormatter.format(total)}
            </span>
          );
        },
      },
      {
        id: "status",
        label: "Status",
        format: (value, row) => {
          const status = row.request?.[0]?.Customer_Status || "N/A";
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                status === "active"
                  ? "bg-green-100 text-green-800"
                  : status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : status === "inactive"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {capitalize(status)}
            </span>
          );
        },
      },
      {
        id: "sangira_status",
        label: "Sangira Status",
        format: (value, row) => {
          const status =
            row?.request?.[0]?.sangira?.Sangira_Status || "Not Requested";
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                status === "active"
                  ? "bg-green-100 text-green-800"
                  : status === "pending"
                  ? "bg-blue-100 text-blue-800"
                  : status === "inactive"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {capitalize(status)}
            </span>
          );
        },
      },
      {
        id: "employee",
        label: "Customer",
        format: (value, row) => (
          <span>{capitalize(row?.employee?.name || "N/A")}</span>
        ),
      },
      {
        id: "Request_Batch_Date",
        label: "Request Date",
        format: (value) => (
          <span>{value ? formatDateTimeForDb(value) : "N/A"}</span>
        ),
      },
      {
        id: "actions",
        label: "Actions",
        minWidth: 150,
        format: (value, row) => {
          const hasSangira = row.request?.some(
            (item) => item.Sangira_ID !== null
          );
          const isRequesting = requestingBatch === row.Request_Batch_ID;

          return (
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={isRequesting ? null : <MdSend />}
              onClick={(e) => {
                e.stopPropagation();
                handleRequestSangiraForBatch(row);
              }}
              disabled={hasSangira || isRequesting}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                padding: "6px 12px",
                minWidth: "auto",
                whiteSpace: "nowrap",
              }}
            >
              {isRequesting
                ? "Requesting..."
                : hasSangira
                ? "Sangira Assigned"
                : "Request Sangira"}
            </Button>
          );
        },
      },
    ];
  }, [requestingBatch]);

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <h4>Customer Requests List</h4>
        </div>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <DatePick
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          className="w-[50%]"
        />
        <DatePick
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          className="w-[50%]"
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
              {!loading && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No customer requests found
                  </TableCell>
                </TableRow>
              )}
              {requests
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.key || row.Request_Batch_ID}
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
                          (e) => typeof e.show === "undefined" || !!e.show
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
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={requests?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
