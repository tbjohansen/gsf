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
  const [requestType, setRequestType] = React.useState({
    id: "house_rent,farm",
    label: "All",
  });
  const [requestStatus, setRequestStatus] = React.useState("");

  const employeeData = localStorage.getItem("userInfo");
  const employee = JSON.parse(employeeData);
  const customer = employee?.customer;

  const navigate = useNavigate();
  const hasFetchedData = React.useRef(false);

  // Fetch requests from API
  React.useEffect(() => {
    // if (!hasFetchedData.current) {
    //   hasFetchedData.current = true;
     
    // }
     loadData();
  }, [startDate, endDate, requestType]);

  const sortedRequestTypes = [
    {
      id: "house_rent,farm",
      label: "All",
    },
    {
      id: "farm",
      label: "Farm",
    },
    {
      id: "house_rent",
      label: "House",
    },
  ];

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

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Customer_ID=${customer?.Customer_ID}`;

      if (startDate) {
        url += `&Start_Date=${formatDateForDb(startDate)}`;
      }

      if (endDate) {
        url += `&End_Date=${formatDateForDb(endDate)}`;
      }

      if (requestType) {
        url += `&Request_Type=${requestType?.id}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        toast.error("Failed to fetch customer requests",
        );
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error( "Failed to fetch customer requests");
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

  const typeOnChange = (e, value) => {
    setRequestType(value);
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

    if (row?.Request_Type === "farm") {
      navigate(`/customer-requests/${row?.Request_ID}/farm-details`);
    } else {
      navigate(`/customer-requests/${row?.Request_ID}/details`);
    }
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
        id: "Customer_Status",
        label: "Status",
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
        label: "Request Type",
        minWidth: 150,
        format: (row, value) => (
          <span>
            {capitalize(value?.estate?.real_estate_type || value?.Request_Type)}
          </span>
        ),
      },
      {
        id: "requested_room",
        label: "Unit Name",
        minWidth: 170,
        format: (row, value) => (
          <span>{value?.estate?.name || value?.item?.Item_Name}</span>
        ),
      },
      {
        id: "requested_room",
        label: "Location",
        minWidth: 170,
        format: (row, value) => (
          <span>{value?.estate?.location?.Unit_Location}</span>
        ),
      },
      {
        id: "price",
        label: "Price",
        minWidth: 170,
        format: (row, value) => (
          <span>
            {currencyFormatter?.format(value?.estate?.price || value?.Price)}
          </span>
        ),
      },
      {
        id: "requested_room",
        label: "Request Date",
        minWidth: 170,
        format: (row, value) => <span>{value?.Request_Date}</span>,
      },
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
          className="w-[25%]"
        />
        <DatePick
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          className="w-[25%]"
        />
        <Autocomplete
          id="combo-box-demo"
          options={sortedRequestTypes}
          size="small"
          disableClearable={true}
          className="w-[25%]"
          value={requestType}
          onChange={typeOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Request Type" />
          )}
        />
        <Autocomplete
          id="combo-box-demo"
          options={sortedRequestStatus}
          size="small"
          freeSolo
          className="w-[25%]"
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
