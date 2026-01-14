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
import DatePick from "../../components/DatePicker";
import { Autocomplete, TextField } from "@mui/material";

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
  const [requestStatus, setRequestStatus] = React.useState("");

  const [customers, setCustomers] = React.useState([]);
  const [items, setItems] = React.useState([]);

  const employeeData = localStorage.getItem("userInfo");
  const employee = JSON.parse(employeeData);
  const customer = employee?.customer;

  const navigate = useNavigate();

  // Fetch requests from API
  React.useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const sortedRequestStatus = [
    {
      id: "active",
      label: "Pending",
    },
    {
      id: "received",
      label: "Received",
    },
    {
      id: "rejected",
      label: "Rejected",
    },
    {
      id: "served",
      label: "Served",
    },
  ];

  const statuOnChange = (e, value) => {
    setRequestStatus(value);
  };

  // const loadCustomers = async () => {
  //   try {
  //     const response = await apiClient.get(
  //       `/customer/customer?Customer_Nature=oxygen&limit=100&page=1`
  //     );

  //     if (response.ok && !response.data?.error) {
  //       const customerData =
  //         response?.data?.data?.data || response?.data?.data || [];
  //       const formattedCustomers = customerData.map((cust) => ({
  //         ...cust,
  //         label: cust.Customer_Name,
  //       }));
  //       setCustomers(
  //         Array.isArray(formattedCustomers) ? formattedCustomers : []
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Fetch customers error:", error);
  //   }
  // };

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Customer_ID=${customer?.Customer_ID}&Request_Type=house_rent&Customer_Status=active`;

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
        toast.error(
          response.data?.error || "Failed to fetch customer requests"
        );
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
        label: "Request Number",
        minWidth: 110,
      },
      {
        id: "Customer_Status",
        label: "Request Status",
        minWidth: 170,
        align: "center",
        format: (row, value) => (
          <Badge
            name={
              value?.Customer_Status === "active"
                ? "Pending"
                : capitalize(value?.Customer_Status)
            }
            color={
              value?.Customer_Status === "served" ||
              value?.Customer_Status === "assign"
                ? "green"
                : value?.Customer_Status === "active"
                ? "yellow"
                : value?.Customer_Status === "received" ||
                  value?.Customer_Status === "requested"
                ? "blue"
                : "red"
            }
          />
        ),
      },
      {
        id: "estate",
        label: "Unit Type",
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(value?.estate?.real_estate_type)}</span>
        ),
      },
      {
        id: "requested_room",
        label: "Unit Name",
        minWidth: 170,
        format: (row, value) => <span>{value?.estate?.name}</span>,
      },
      {
        id: "price",
        label: "Monthly Price",
        minWidth: 170,
        format: (row, value) => (
          <span>{currencyFormatter?.format(value?.estate?.price)}</span>
        ),
      },
      // {
      //   id: "sangira_status",
      //   label: "Sangira Status",
      //   format: (value, row) => {
      //     const status =
      //       row?.request?.[0]?.sangira?.Sangira_Status || "Not Requested";
      //     return (
      //       <span
      //         className={`px-2 py-1 rounded text-xs font-medium ${
      //           status === "active"
      //             ? "bg-green-100 text-green-800"
      //             : status === "pending"
      //             ? "bg-blue-100 text-blue-800"
      //             : status === "inactive"
      //             ? "bg-red-100 text-red-800"
      //             : "bg-gray-100 text-gray-800"
      //         }`}
      //       >
      //         {capitalize(status)}
      //       </span>
      //     );
      //   },
      // },
    ];
  }, []);

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
          className="w-[33%]"
        />
        <DatePick
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          className="w-[33%]"
        />
        <Autocomplete
          id="combo-box-demo"
          options={sortedRequestStatus}
          size="small"
          freeSolo
          className="w-[34%]"
          value={requestStatus}
          onChange={statuOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Request Status" />
          )}
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
