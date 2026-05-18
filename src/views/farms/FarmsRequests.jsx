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
import { capitalize, currencyFormatter, formatDateTimeForDb, formatter } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { useMemo } from "react";
import moment from "moment";
import { Autocomplete, TextField } from "@mui/material";
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

export default function FarmsRequests() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [requestsList, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [farms, setFarms] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(moment().startOf("year"));
  const [endDate, setEndDate] = useState(moment());
  const [farm, setFarm] = useState("");
  const [bank, setBank] = useState("");
  const [sangiraNumber, setSangiraNumber] = useState("");
  const [sangiraLoadingId, setSangiraLoadingId] = useState(null);

  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadFarms();
  }, []);

  const sortedPaymentStatus = [
    { id: "requested", label: "Pending" },
    { id: "expired", label: "Expired" },
    { id: "paid", label: "Completed" },
  ];

  const sortedBank = [
    { id: "to_crdb", label: "CRDB" },
    { id: "to_nmb", label: "NMB" },
    { id: "to_nbc", label: "NBC" },
  ];

  const paymentStatuOnChange = (e, value) => {
    setPaymentStatus(value);
  };

  const bankOnChange = (e, value) => {
    setBank(value);
  };

  const sortedFarms = farms?.map((farmm) => ({
    id: farmm?.Item_ID,
    label: farmm?.Item_Name,
  }));

  const farmOnChange = (e, value) => {
    setFarm(value);
  };

  const loadFarms = async () => {
    try {
      const response = await apiClient.get("/settings/item", {
        Item_Type: "farm",
      });

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      // Adjust based on your API response structure
      const featuresData = response?.data?.data;
      const newData = featuresData?.map((feature, index) => ({
        ...feature,
        key: index + 1,
      }));
      // console.log(newData);
      setFarms(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch farms error:", error);
    }
  };

  const hasFetchedData = useRef(false);

  useEffect(() => {
    loadData();
  }, [
    rowsPerPage,
    page,
    farm,
    bank,
    startDate,
    endDate,
    paymentStatus,
    sangiraNumber,
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=farm&limit=${rowsPerPage}&page=${page}`;

      if (name) url += `&Customer_Name=${name}`;
      if (sangiraNumber) url += `&Sangira_Number=${sangiraNumber}`;
      if (paymentStatus) url += `&Customer_Status=${paymentStatus?.id}`;
      if (farm) url += `&Item_ID=${hostel?.id}`;
      if (bank) url += `&Payment_Channel=${bank?.id}`;
      if (startDate) url += `&Start_Date=${formatDateTimeForDb(startDate)}`;
      if (endDate) url += `&End_Date=${formatDateTimeForDb(endDate)}`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);

        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          const serverMessage =
            response?.data?.error || response?.data?.message;

          let errorText;
          if (typeof serverMessage === "string") {
            errorText = serverMessage;
          } else if (
            typeof serverMessage === "object" &&
            serverMessage !== null
          ) {
            errorText = Object.values(serverMessage).flat()[0];
          } else {
            errorText = "Failed to load farm requests";
          }

          toast.error(errorText);
        }
        return;
      }

      const responseData = response?.data?.data;
      const unitsData = responseData?.data || [];

      const newData = unitsData?.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setList(Array.isArray(newData) ? newData : []);

      // Update pagination state
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
      console.error("Fetch requests error:", error);
      setLoading(false);
      toast.error("Failed to load requests");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 25);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const sangiraReconciliation = async (recoData) => {
    setSangiraLoadingId(recoData?.Sangira?.Sangira_Number);

    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      setSangiraLoadingId(null);
      return;
    }

    try {
      const response = await apiClient.post("/customer/sychronize-sangira", {
        Sangira_Number: recoData?.Sangira?.Sangira_Number,
        Employee_ID: employeeId,
      });

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
              : "Failed to reconcile sangira payment",
          );
        }
        setSangiraLoadingId(null);
        return;
      }

      toast.success("Sangira payment reconciled successfully");
      setSangiraLoadingId(null);
      loadData();
    } catch (error) {
      console.error("Sangira reconcile error:", error);
      setSangiraLoadingId(null);
      toast.error("Failed to reconcile sangira payment");
    }
  };

  // Inside the Hostels component, replace the columns definition with:
  const columns = useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "name",
        label: "Full Name",
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Customer_Name)}</span>
        ),
      },
      {
        id: "gender",
        label: "Gender",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Gender)}</span>
        ),
      },
      {
        id: "student_id",
        label: "Customer ID",
        minWidth: 110,
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Student_ID)}</span>
        ),
      },
      {
        id: "Customer_Status",
        label: "Request Status",
        minWidth: 140,
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
              value?.Customer_Status === "assign" ||
              value?.Customer_Status === "paid"
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
        id: "requested_room",
        label: "Farm Name",
        minWidth: 170,
        format: (row, value) => <span>{value?.item?.Item_Name}</span>,
      },
      {
        id: "price",
        label: "Price @ 0.25 Hectare",
        minWidth: 170,
        format: (row, value) => (
          <span>{currencyFormatter?.format(value?.item?.Item_Price)}</span>
        ),
      },
      {
        id: "size",
        label: "Requested Size",
        minWidth: 170,
        format: (row, value) => (
          <span>{value?.Requested_Farm_Size || 0} Hectares</span>
        ),
      },
      {
        id: "allocated size",
        label: "Allocated Size",
        minWidth: 170,
        format: (row, value) => <span>{value?.Quantity || 0} Hectares</span>,
      },
      {
        id: "total_amount",
        label: "Total Amount",
        format: (row, value) => (
          <span>
            {value?.Sangira
              ? currencyFormatter?.format(
                  value?.Sangira?.Grand_Total_Price || 0,
                )
              : null}
          </span>
        ),
      },
      {
        id: "sangira_number",
        label: "Sangira",
        format: (row, value) => (
          <span>{value?.Sangira?.Sangira_Number || ""}</span>
        ),
      },
      {
        id: "requested_at",
        label: "Requested Date",
        minWidth: 170,
        format: (row, value) => <span>{value?.Sangira?.Requested_Date}</span>,
      },
      {
        id: "status",
        label: "Payment Status",
        minWidth: 170,
        align: "center",
        format: (row, value) => (
          <>
            {value?.Sangira ? (
              <Badge
                name={capitalize(value?.Sangira?.Sangira_Status)}
                color={
                  value?.Sangira?.Sangira_Status === "completed"
                    ? "green"
                    : value?.Sangira?.Sangira_Status === "pending"
                      ? "blue"
                      : "red"
                }
              />
            ) : null}
          </>
        ),
      },
      {
        id: "completed_date",
        label: "Payment Date",
        minWidth: 170,
        format: (row, value) => <span>{value?.Sangira?.Completed_Date}</span>,
      },
      {
        id: "payment_receipt",
        label: "Receipt",
        format: (row, value) => <span>{value?.Sangira?.Receipt_Number}</span>,
      },
      { id: "actions", label: "Actions", align: "center" },
    ],
    [],
  );

  const handleRowClick = (row) => {
    navigate(`/projects/farms/requests/${row?.Request_ID}/receive`);
  };

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <h4>Requests List</h4>
        </div>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <DatePick
          label="Start Date"
          className="w-[33%]"
          value={startDate ? moment(startDate) : null}
          onChange={(newDate) => setStartDate(newDate)}
        />
        <DatePick
          label="End Date"
          className="w-[33%]"
          maxDate={moment()}
          value={endDate ? moment(endDate) : null}
          onChange={(newDate) => setEndDate(newDate)}
        />
        <Autocomplete
          id="payment-type-filter"
          options={sortedFarms}
          size="small"
          freeSolo
          className="w-[34%]"
          value={farm}
          onChange={farmOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Farm" />
          )}
        />
      </div>
      <div className="w-full py-2 flex gap-2 mb-1">
        <TextField
          size="small"
          id="name-filter"
          label={"Customer Name"}
          variant="outlined"
          className="w-[25%]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <TextField
          size="small"
          id="sangira-filter"
          label="Sangira Number"
          variant="outlined"
          className="w-[25%]"
          value={sangiraNumber}
          onChange={(e) => setSangiraNumber(e.target.value)}
        />

        <Autocomplete
          id="payment-status-filter"
          options={sortedBank}
          size="small"
          freeSolo
          className="w-[25%]"
          value={bank}
          onChange={bankOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Bank" />
          )}
        />

        <Autocomplete
          id="payment-status-filter"
          options={sortedPaymentStatus}
          size="small"
          freeSolo
          className="w-[25%]"
          value={paymentStatus}
          onChange={paymentStatuOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Payment Status" />
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
              {requestsList?.map((row) => {
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
                    {columns?.map((column) => {
                      // ── Actions cell: rendered inline — always reads latest state ──
                      if (column.id === "actions") {
                        const isLoading =
                          sangiraLoadingId === row?.Sangira?.Sangira_Number;
                        const isPaid =
                          row?.Customer_Status === "completed" ||
                          row?.Customer_Status === "paid" ||
                          row?.Customer_Status === "admitted";
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex gap-4 justify-center">
                              {!isPaid ? (
                                <button
                                  onClick={() => sangiraReconciliation(row)}
                                  disabled={isLoading}
                                  className="flex h-8 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-1.5 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isLoading ? "Loading..." : "Reconcile"}
                                </button>
                              ) : null}
                            </div>
                          </TableCell>
                        );
                      }

                      // ── All other cells ──
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format ? column.format(value, row) : value}
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
          rowsPerPageOptions={[25, 50, 100, 1000]}
          component="div"
          count={pagination?.total}
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
