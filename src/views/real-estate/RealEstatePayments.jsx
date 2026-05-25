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
  formatter,
  reportError,
  removeUnderscore,
  formatDateForDb,
  formatDateTimeForDb,
} from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { Autocomplete, Button, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TbDownload } from "react-icons/tb";
import * as XLSX from "xlsx";
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

export default function RealEstatePayments() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [payments, setPayments] = useState([]);
  const [locations, setLocations] = useState([]);

  const [paymentType, setPaymentType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [sangiraNumber, setSangiraNumber] = useState("");
  const [startDate, setStartDate] = useState(
    moment().subtract(1, "year").startOf("year"),
  );
  const [endDate, setEndDate] = useState(moment());
  const [bank, setBank] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const sortedPaymentTypes = [
    {
      id: "house",
      label: "Rental House",
    },
    {
      id: "business_land",
      label: "Rental Space",
    },
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

  const sortedLocations = locations?.map((hostel) => ({
    id: hostel?.Unit_Location_ID,
    label: hostel?.Unit_Location,
  }));

  const locationOnChange = (e, value) => {
    setLocation(value);
  };

  const paymentTypeOnChange = (e, value) => {
    setPaymentType(value);
  };

  const sortedPaymentStatus = [
    {
      id: "Requested",
      label: "Pending",
    },
    {
      id: "expired",
      label: "Expired",
    },
    {
      id: "completed",
      label: "Completed",
    },
  ];

  // Fetch payments from API
  useEffect(() => {
    loadData();
  }, [
    page,
    rowsPerPage,
    name,
    sangiraNumber,
    paymentType,
    paymentStatus,
    bank,
    startDate,
    endDate,
    location,
    unitName,
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Request_Type=house_rent,business_land&limit=${rowsPerPage}&page=${page}`;

      if (name) url += `&Customer_Name=${name}`;
      if (unitName) url += `&Item_Name=${unitName}`;
      if (sangiraNumber) url += `&Sangira_Number=${sangiraNumber}`;
      if (paymentStatus) url += `&Customer_Status=${paymentStatus?.id}`;
      if (paymentType) url += `&Request_Type=${paymentType?.id}`;
      if (location) url += `&Hostel_ID=${location?.id}`;
      if (bank) url += `&Payment_Channel=${bank?.id}`;
      if (startDate) url += `&Start_Date=${formatDateTimeForDb(startDate)}`;
      if (endDate) url += `&End_Date=${formatDateTimeForDb(endDate)}`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        reportError(response, "Failed to fetch payments");
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
    doc.text("GSF Houses Payments List", 40, 40);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 40, 58);

    const tableColumns = [
      "S/N",
      "Customer Name",
      "Nationality",
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
      row?.customer?.Nationality || "-",
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

    doc.save("GSF-Houses-Payments.pdf");
  };

  const handleDownloadExcel = () => {
    const tableData = payments?.map((row, index) => ({
      "S/N": index + 1,
      "Customer Name": capitalize(row?.customer?.Customer_Name) || "-",
      Gender: row?.customer?.Gender,
      Phone: row?.customer?.Phone_Number,
      Nationality: row?.customer?.Nationality,
      "Payment Type": row?.item?.Item_Name,
      Price: row?.Price || 0,
      Duration: row?.Quantity ? `${row.Quantity} months` : "-",
      "Total Amount": row?.Quantity * row?.Price || 0,
      "Sangira Amount": row?.Sangira?.Grand_Total_Price || 0,
      Sangira: row?.Sangira?.Sangira_Number || "-",
      "Payment Date": row?.Sangira?.Completed_Date || "-",
      Receipt: row?.Sangira?.Receipt_Number || "-",
      Bank: extractBank(row?.payment?.Payment_Channel) || "-",
      House: row?.room?.hostel?.Hostel_Name,
      Location: row?.room?.block?.Block_Name,
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

    if (location) summaryRows.push(["Unit Location", location?.label]);
    if (bank) summaryRows.push(["Bank", bank?.label]);

    summaryRows.push(
      ["Total Transactions Recorded", totalRows],
      ["Total Amount Collected (TZS)", totalPaid],
      ["Total Houses", 0],
      ["Occupied Houses", 0],
      ["Available Houses", 0],
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "GSF Houses Payments");
    XLSX.writeFile(workbook, `GSF-Houses-Payments-${Date.now()}.xlsx`);
  };

  // Inside the Hostels component, replace the columns definition with:
  const columns = useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "name",
        label: "Customer Name",
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
        id: "total_amount",
        label: "Total Amount",
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
        id: "Request_Type",
        label: "Payment Type",
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(removeUnderscore(value?.Request_Type))}</span>
        ),
      },
      {
        id: "payment_mode",
        label: "Payment Mode",
        minWidth: 170,
        format: (row, value) => (
          <span>
            {value?.Sangira?.Sangira_Number
              ? "SANGIRA NUMBER"
              : "SALARY DEDUCTION"}
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
        format: (row, value) => <span>{value?.Sangira?.Completed_Date}</span>,
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
          <span>{value?.customer?.Customer_Type === "foreigner" ? <>USD {formatter?.format(value?.estate?.usd_price)}</> : <>{currencyFormatter?.format(value?.estate?.price)}</>}</span>
        ),
      },
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
            disabled={loading || payments?.length === 0}
            sx={{ textTransform: "none" }}
          >
            Download EXCEL
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<TbDownload />}
            onClick={handleDownloadPDF}
            disabled={loading || payments?.length === 0}
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
          options={sortedLocations}
          size="small"
          freeSolo
          className="w-[25%]"
          value={location}
          onChange={locationOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Location" />
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

      <div className="w-full py-2 flex gap-2 mb-1">
        <TextField
          size="small"
          id="outlined-basic"
          label={"Customer Name"}
          variant="outlined"
          className="w-[25%]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <TextField
          size="small"
          id="outlined-basic"
          label="Sangira Number"
          variant="outlined"
          className="w-[25%]"
          value={sangiraNumber}
          onChange={(e) => setSangiraNumber(e.target.value)}
          autoFocus
        />
        <Autocomplete
          id="combo-box-demo"
          options={sortedPaymentTypes}
          size="small"
          freeSolo
          className="w-[25%]"
          value={paymentType}
          onChange={paymentTypeOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Payment Type" />
          )}
        />
        <Autocomplete
          id="combo-box-demo"
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
              {payments?.map((row) => {
                return (
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
                            // Prevent click event from bubbling up to the row
                            // when clicking on action buttons
                            if (column.id === "actions") {
                              e.stopPropagation();
                            }
                          }}
                        >
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
          rowsPerPageOptions={[25, 50, 100, 200, 500, 1000]}
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
