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
  extractBank,
  formatDateForDb,
  formatDateTimeForDb,
  formatter,
} from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { Autocomplete, Button, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TbDownload } from "react-icons/tb";
import * as XLSX from "xlsx";
import moment from "moment";
import DatePick from "../../components/DatePicker";
import { useRef } from "react";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function HostelPayments() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [payments, setPayments] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(
    moment().subtract(1, "year").startOf("year"),
  );
  const [endDate, setEndDate] = useState(moment());
  const [hostel, setHostel] = useState("");
  const [bank, setBank] = useState("");
  const [sangiraNumber, setSangiraNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sangiraLoadingId, setSangiraLoadingId] = useState(null);
  const [bedStats, setBedStatistics] = useState([]);
  const hasFetchedData = useRef(false);

  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();

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

  const sortedHostels = hostels?.map((hostel) => ({
    id: hostel?.Hostel_ID,
    label: hostel?.Hostel_Name,
  }));

  const hostelOnChange = (e, value) => {
    setHostel(value);
  };

  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadHostels();
      loadBedStats();
    }
  }, []);

  const loadBedStats = async () => {
    // setStatsLoading(true);
    try {
      const response = await apiClient.get("/customer/hostel-bed-statistics");

      if (!response.ok) {
        // setStatsLoading(false);
        // toast.error(response.data?.error || "Failed to fetch employees");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        // setStatsLoading(false);
        // toast.error(response.data.error || "Failed to fetch employees");
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data;
      // console.log(userData);
      setBedStatistics(userData);
      // setStatsLoading(false);
    } catch (error) {
      console.error("Fetch employees error:", error);
      // setStatsLoading(false);
      // toast.error("Failed to load employees");
    }
  };

  const getBedTotals = (data, hostelId = null) => {
    // Apply hostel ID filter if provided
    let filteredData = data;
    if (hostelId !== null) {
      filteredData = data.filter((item) => item.Hostel_ID === hostelId);
    }

    return {
      totalBeds: filteredData.reduce(
        (sum, item) => sum + parseInt(item.total_beds),
        0,
      ),
      totalOccupiedBeds: filteredData.reduce(
        (sum, item) => sum + parseInt(item.occupied_beds),
        0,
      ),
      totalRemainingBeds: filteredData.reduce(
        (sum, item) => sum + parseInt(item.remaining_beds),
        0,
      ),
      totalRevenue: filteredData.reduce(
        (sum, item) => sum + item.occupied_total_price,
        0,
      ),
      totalMale: filteredData.reduce(
        (sum, item) => sum + parseInt(item.total_male),
        0,
      ),
      totalFemale: filteredData.reduce(
        (sum, item) => sum + parseInt(item.total_female),
        0,
      ),
      totalOccupiedGender: filteredData.reduce(
        (sum, item) => sum + parseInt(item.total_occupied_gender),
        0,
      ),
    };
  };

  function getOverallOccupancyRate(data) {
    const totalBeds = data?.reduce(
      (sum, item) => sum + parseInt(item.total_beds),
      0,
    );
    const totalOccupied = data?.reduce(
      (sum, item) => sum + parseInt(item.occupied_beds),
      0,
    );

    const occupancyRate = (totalOccupied / totalBeds) * 100;
    return parseFloat(occupancyRate.toFixed(2));
  }

  const occupancyRate = getOverallOccupancyRate(bedStats);

  const bedTotals = getBedTotals(bedStats);

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

  const loadHostels = async () => {
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
      const newData = hostelData?.map((hostel, index) => ({
        ...hostel,
        key: index + 1,
      }));
      setHostels(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch hostels error:", error);
      toast.error("Failed to load hostels");
    }
  };

  useEffect(() => {
    loadData();
  }, [
    name,
    customerID,
    sangiraNumber,
    paymentType,
    paymentStatus,
    bank,
    hostel,
    startDate,
    endDate,
    page,
    rowsPerPage,
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=hostel&limit=${rowsPerPage}&page=${page}`;

      if (name) url += `&Customer_Name=${name}`;
      if (customerID) url += `&Student_ID=${customerID}`;
      if (sangiraNumber) url += `&Sangira_Number=${sangiraNumber}`;
      if (paymentStatus) url += `&Customer_Status=${paymentStatus?.id}`;
      if (hostel) url += `&Hostel_ID=${hostel?.id}`;
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
            errorText = "Failed to load payments";
          }

          toast.error(errorText);
        }
        return;
      }

      const responseData = response?.data?.data;
      const unitsData = responseData?.data || [];

      const newData = unitsData.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setPayments(Array.isArray(newData) ? newData : []);

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
      console.error("Fetch payments error:", error);
      setLoading(false);
      toast.error("Failed to load payments");
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("GSF Hostels Payments List", 40, 40);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 40, 58);

    const tableColumns = [
      "S/N",
      "Student Name",
      "Student ID",
      "Price",
      "Duration",
      "Total Amount",
      "Sangira",
      "Payment Date",
      "Receipt",
      "Bank",
    ];

    const tableRows = payments.map((row, index) => [
      index + 1,
      capitalize(row?.customer?.Customer_Name) || "-",
      row?.customer?.Student_ID || "-",
      row?.Price ? formatter.format(row.Price) : "-",
      row?.Quantity ? `${row.Quantity} months` : "-",
      row?.Sangira?.Grand_Total_Price
        ? formatter.format(row.Sangira.Grand_Total_Price)
        : row?.Price
          ? formatter.format(row.Price)
          : "-",
      row?.Sangira?.Sangira_Number || "-",
      row?.Sangira?.Completed_Date || "-",
      row?.Sangira?.Receipt_Number || "-",
      extractBank(row?.payment?.Payment_Channel) || "-",
    ]);

    const totalAmount = payments.reduce(
      (sum, row) => sum + (row?.Sangira?.Grand_Total_Price || row?.Price || 0),
      0,
    );

    // Fix: Use "Total" instead of "TOTAL" and add empty strings for alignment
    const totalRow = [
      "Total", // Shorter word to fit in narrow column
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      formatter.format(totalAmount),
    ];

    autoTable(doc, {
      startY: 72,
      head: [tableColumns],
      body: [...tableRows, totalRow],
      styles: { fontSize: 11, cellPadding: 4, overflow: "linebreak" },
      headStyles: {
        fillColor: [245, 246, 250],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: {
        0: { cellWidth: 35 }, // Increased from 28 to 35 to fit "Total"
        1: { cellWidth: 80 },
        2: { cellWidth: 65 },
        3: { cellWidth: 55 },
        4: { cellWidth: 55 },
        5: { cellWidth: 65 },
        6: { cellWidth: 68 },
        7: { cellWidth: 65 },
        8: { cellWidth: 65 },
        9: { cellWidth: 70 },
      },
      didParseCell: (data) => {
        if (data.row.index === tableRows.length) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 230, 245];
          data.cell.styles.textColor = [0, 0, 0];
        }
      },
      margin: { left: 40, right: 40 },
    });

    doc.save("GSF-Hostels-Payments.pdf");
  };

  const handleDownloadExcel = () => {
    const tableData = payments?.map((row, index) => ({
      "S/N": index + 1,
      "Student Name": capitalize(row?.customer?.Customer_Name) || "-",
      "Student ID": row?.customer?.Student_ID || row?.customer?.Admission_ID,
      Gender: row?.customer?.Gender,
      Phone: row?.customer?.Phone_Number,
      "Program Of Study": row?.customer?.Program_Study,
      "Payment Type": row?.item?.Item_Name,
      Price: row?.Price || 0,
      Duration: row?.Quantity ? `${row.Quantity} months` : "-",
      "Total Amount": row?.Quantity * row?.Price || 0,
      "Sangira Amount": row?.Sangira?.Grand_Total_Price || 0,
      Sangira: row?.Sangira?.Sangira_Number || "-",
      "Payment Date": row?.Sangira?.Completed_Date || "-",
      Receipt: row?.Sangira?.Receipt_Number || "-",
      Bank: extractBank(row?.payment?.Payment_Channel) || "-",
      Hostel: row?.room?.hostel?.Hostel_Name,
      Block: row?.room?.block?.Block_Name,
      Floor: row?.room?.flow?.Flow_Name,
      Room: row?.room?.Room_Name,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(tableData);

    const headers = Object.keys(tableData[0] || {});
    const totalRows = tableData.length;
    const dataStartRow = 2;
    const totalRow = totalRows + 2;
    const colLetter = (idx) => String.fromCharCode(65 + idx);
    const totalAmountColIdx = headers.indexOf("Total Amount");

    worksheet[`A${totalRow}`] = { v: "TOTAL", t: "s" };

    if (totalAmountColIdx !== -1) {
      const col = colLetter(totalAmountColIdx);
      worksheet[`${col}${totalRow}`] = {
        f: `SUM(${col}${dataStartRow}:${col}${totalRows + 1})`,
        t: "n",
      };
    }

    const summaryStartRow = totalRow + 2;
    const occupiedBeds = payments?.length ?? 0;
    const seenSangiraNumbers = new Set();

    const totalPaid = payments?.reduce((sum, r) => {
      const sangiraNumber = r?.Sangira?.Sangira_Number;

      // If this Sangira_Number has been seen before, skip adding its value
      if (sangiraNumber && seenSangiraNumbers.has(sangiraNumber)) {
        return sum;
      }

      // Mark this Sangira_Number as seen
      if (sangiraNumber) {
        seenSangiraNumbers.add(sangiraNumber);
      }

      // Add the price to sum
      return sum + (r?.Sangira?.Grand_Total_Price || r?.Price || 0);
    }, 0);

    const summaryRows = [["SUMMARY", ""]];

    if (startDate && endDate) {
      summaryRows.push([
        "Report Duration",
        `${formatDateForDb(startDate)} — ${formatDateForDb(endDate)}`,
      ]);
    }

    if (hostel) summaryRows.push(["Hostel", hostel?.label]);
    if (bank) summaryRows.push(["Bank", bank?.label]);

    summaryRows.push(
      ["Total Transactions Recorded", totalRows],
      ["Total Amount Collected (TZS)", totalPaid],
      ["Total Beds", bedTotals?.totalBeds || 0],
      ["Occupied Beds", bedTotals?.totalOccupiedBeds || 0],
      ["Available Beds", bedTotals?.totalRemainingBeds || 0],
    );

    summaryRows.forEach((rowData, i) => {
      const excelRow = summaryStartRow + i;
      worksheet[`B${excelRow}`] = { v: rowData[0], t: "s" };
      if (rowData[1] !== undefined && rowData[1] !== "") {
        worksheet[`C${excelRow}`] = {
          v: rowData[1],
          t: typeof rowData[1] === "number" ? "n" : "s",
        };
      }
    });

    const lastRow = summaryStartRow + summaryRows.length - 1;
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    range.e.r = lastRow - 1;
    worksheet["!ref"] = XLSX.utils.encode_range(range);

    XLSX.utils.book_append_sheet(workbook, worksheet, "GSF Hostels Payments");
    XLSX.writeFile(workbook, `GSF-Hostels-Payments-${Date.now()}.xlsx`);
  };

  // Actions column is excluded from useMemo — rendered inline to avoid stale closures
  const columns = useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "name",
        label: "Student Name",
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Customer_Name)}</span>
        ),
      },
      {
        id: "studentId",
        label: "Student ID",
        minWidth: 170,
        format: (row, value) => <span>{value?.customer?.Student_ID}</span>,
      },
      {
        id: "gender",
        label: "Gender",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Gender)}</span>
        ),
      },
      {
        id: "paymentType",
        label: "Payment Type",
        minWidth: 180,
        format: (row, value) => <span>{value?.item?.Item_Name}</span>,
      },
      {
        id: "price",
        label: "Price",
        minWidth: 170,
        format: (row, value) => (
          <span>{currencyFormatter?.format(value?.Price)}</span>
        ),
      },
      {
        id: "duration",
        label: "Duration",
        minWidth: 170,
        format: (row, value) => <span>{value?.Quantity}</span>,
      },
      {
        id: "total_amount",
        label: "Total Amount",
        minWidth: 150,
        format: (row, value) => (
          <span>
            {currencyFormatter.format(value?.Quantity * value?.Price)}
          </span>
        ),
      },
      {
        id: "total_amount",
        label: "Sangira Amount",
        minWidth: 150,
        format: (row, value) => (
          <span>
            {currencyFormatter.format(
              value?.Sangira?.Grand_Total_Price || value?.Price,
            )}
          </span>
        ),
      },
      {
        id: "requested_hostel",
        label: "Hostel",
        minWidth: 170,
        format: (row, value) => <span>{value?.room?.hostel?.Hostel_Name}</span>,
      },
      {
        id: "requested_block",
        label: "Block",
        minWidth: 170,
        format: (row, value) => <span>{value?.room?.block?.Block_Name}</span>,
      },
      {
        id: "requested_room",
        label: "Room",
        minWidth: 170,
        format: (row, value) => <span>{value?.room?.Room_Name}</span>,
      },
      {
        id: "sangira_number",
        label: "Sangira",
        format: (row, value) => (
          <span>{value?.Sangira?.Sangira_Number || ""}</span>
        ),
      },
      {
        id: "status",
        label: "Status",
        align: "center",
        format: (row, value) => (
          <>
            {value?.Sangira?.Sangira_Status ? (
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
        id: "requested_at",
        label: "Requested Date",
        minWidth: 180,
        format: (row, value) => <span>{value?.Sangira?.Requested_Date}</span>,
      },
      {
        id: "completed_date",
        label: "Payment Date",
        minWidth: 170,
        format: (row, value) => <span>{value?.Sangira?.Payment_Date}</span>,
      },
      {
        id: "payment_receipt",
        label: "Receipt",
        format: (row, value) => <span>{value?.Sangira?.Receipt_Number}</span>,
      },
      {
        id: "bank",
        label: "Bank Name",
        minWidth: 170,
        format: (row, value) => (
          <span>{extractBank(value?.payment?.Payment_Channel)}</span>
        ),
      },
      { id: "actions", label: "Actions", align: "center" },
    ],
    [],
  );

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12 flex items-center justify-between">
        <h4>Payments List</h4>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="contained"
            size="small"
            startIcon={<TbDownload />}
            onClick={handleDownloadExcel}
            disabled={loading || payments.length === 0}
            sx={{ textTransform: "none" }}
          >
            Download EXCEL
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<TbDownload />}
            onClick={handleDownloadPDF}
            disabled={loading || payments.length === 0}
            sx={{ textTransform: "none" }}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <div className="w-full py-1 flex flex-row gap-2">
        <DatePick
          label="Start Date"
          className="w-[25%]"
          value={startDate ? moment(startDate) : null}
          onChange={(newDate) => setStartDate(newDate)}
        />
        <DatePick
          label="End Date"
          className="w-[25%]"
          maxDate={moment()}
          value={endDate ? moment(endDate) : null}
          onChange={(newDate) => setEndDate(newDate)}
        />
        <Autocomplete
          id="hostel-filter"
          options={sortedHostels}
          size="small"
          freeSolo
          className="w-[25%]"
          value={hostel}
          onChange={hostelOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Hostel" />
          )}
        />
        <Autocomplete
          id="bank-filter"
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
      </div>

      <div className="w-full py-2 flex flex-row gap-2 mb-1">
        <TextField
          size="small"
          id="name-filter"
          label="Student Name"
          variant="outlined"
          className="w-[25%]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <TextField
          size="small"
          id="customerid-filter"
          label="Student ID"
          variant="outlined"
          className="w-[25%]"
          value={customerID}
          onChange={(e) => setCustomerID(e.target.value)}
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
              {payments?.map((row) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={row.key || row.id}
                  sx={{
                    backgroundColor:
                      selectedRow?.key === row.key
                        ? "rgba(0, 0, 0, 0.04)"
                        : "inherit",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100, 1000]}
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
  );
}
