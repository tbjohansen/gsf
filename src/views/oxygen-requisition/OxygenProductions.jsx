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
  MdDownload,
  MdGridOn,
  MdPictureAsPdf,
  MdSend,
  MdSwapHoriz,
  MdAssignmentReturn,
  MdAddChart,
} from "react-icons/md";
import {
  Autocomplete,
  TextField,
  Checkbox,
  IconButton,
  Button,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Menu,
} from "@mui/material";
import DatePick from "../../components/DatePicker";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function OxygenProductions({ status }) {
  const [activeTab, setActiveTab] = React.useState(0);

  // Productions state
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [productions, setProductions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [exportLoading, setExportLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [item, setItem] = React.useState("");
  const [employee, setEmployee] = React.useState("");
  const [employees, setEmployees] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [pagination, setPagination] = React.useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  // Transfers state
  const [transfersPage, setTransfersPage] = React.useState(1);
  const [transfersRowsPerPage, setTransfersRowsPerPage] = React.useState(25);
  const [transfers, setTransfers] = React.useState([]);
  const [transfersLoading, setTransfersLoading] = React.useState(false);
  const [selectedTransfer, setSelectedTransfer] = React.useState(null);
  const [transferStartDate, setTransferStartDate] = React.useState(null);
  const [transferEndDate, setTransferEndDate] = React.useState(null);
  const [transferItem, setTransferItem] = React.useState("");
  const [transferToLocation, setTransferToLocation] = React.useState("");
  const [transferPagination, setTransferPagination] = React.useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  // Returned Items state
  const [returnsPage, setReturnsPage] = React.useState(1);
  const [returnsRowsPerPage, setReturnsRowsPerPage] = React.useState(25);
  const [returnedItems, setReturnedItems] = React.useState([]);
  const [returnsLoading, setReturnsLoading] = React.useState(false);
  const [selectedReturn, setSelectedReturn] = React.useState(null);
  const [returnStartDate, setReturnStartDate] = React.useState(null);
  const [returnEndDate, setReturnEndDate] = React.useState(null);
  const [returnItem, setReturnItem] = React.useState("");
  const [returnReason, setReturnReason] = React.useState("");
  const [returnsPagination, setReturnsPagination] = React.useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();

  // Fetch productions data
  React.useEffect(() => {
    if (activeTab === 0) {
      loadProductions();
    }
  }, [startDate, endDate, item, employee, page, rowsPerPage, activeTab]);

  // Fetch transfers data
  React.useEffect(() => {
    if (activeTab === 1) {
      loadTransfers();
    }
  }, [
    transferStartDate,
    transferEndDate,
    transferItem,
    transferToLocation,
    transfersPage,
    transfersRowsPerPage,
    activeTab,
  ]);

  // Fetch returned items data
  React.useEffect(() => {
    if (activeTab === 2) {
      loadReturnedItems();
    }
  }, [
    returnStartDate,
    returnEndDate,
    returnItem,
    returnReason,
    returnsPage,
    returnsRowsPerPage,
    activeTab,
  ]);

  const loadProductions = async () => {
    setLoading(true);
    try {
      let url = `/oxygen/production?&limit=${rowsPerPage}&page=${page}`;

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
            errorText = "Failed to fetch productions";
          }
          toast.error(errorText);
        }
        return;
      }

      const responseData = response?.data?.data;
      const userData = responseData?.data || [];

      const newData = userData?.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setProductions(Array.isArray(newData) ? newData : []);

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
      console.error("Fetch production details error:", error);
      setLoading(false);
      toast.error("Failed to load production details");
    }
  };

  const loadTransfers = async () => {
    setTransfersLoading(true);
    try {
      let url = `/oxygen/shifted-oxygen-item?&limit=${transfersRowsPerPage}&page=${transfersPage}`;

      if (transferStartDate) {
        url += `&Start_Date=${formatDateForDb(transferStartDate)}`;
      }

      if (transferEndDate) {
        url += `&End_Date=${formatDateForDb(transferEndDate)}`;
      }

      if (transferItem) {
        url += `&Item_ID=${transferItem?.Item_ID}`;
      }

      if (transferToLocation) {
        url += `&To_Location=${transferToLocation}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setTransfersLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else {
          toast.error("Failed to fetch transfers");
        }
        return;
      }

      const responseData = response?.data?.data;
      const transfersData = responseData?.data || [];

      const newData = transfersData?.map((transfer, index) => ({
        ...transfer,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setTransfers(Array.isArray(newData) ? newData : []);

      setTransferPagination({
        total: responseData?.total || 0,
        perPage: responseData?.per_page || 25,
        currentPage: responseData?.current_page || 1,
        lastPage: responseData?.last_page || 1,
        from: responseData?.from || 0,
        to: responseData?.to || 0,
      });

      setTransfersLoading(false);
    } catch (error) {
      console.error("Fetch transfers error:", error);
      setTransfersLoading(false);
      toast.error("Failed to load transfers");
    }
  };

  const loadReturnedItems = async () => {
    setReturnsLoading(true);
    try {
      let url = `/oxygen/shifted-oxygen-item?&limit=${returnsRowsPerPage}&page=${returnsPage}&Cached_Item=approved&Rejected=yes`;

      if (returnStartDate) {
        url += `&Start_Date=${formatDateForDb(returnStartDate)}`;
      }

      if (returnEndDate) {
        url += `&End_Date=${formatDateForDb(returnEndDate)}`;
      }

      if (returnItem) {
        url += `&Item_ID=${returnItem?.Item_ID}`;
      }

      if (returnReason) {
        url += `&Reason=${returnReason}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setReturnsLoading(false);
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else {
          toast.error("Failed to fetch returned items");
        }
        return;
      }

      const responseData = response?.data?.data;
      const returnsData = responseData?.data || [];

      const newData = returnsData?.map((returnItem, index) => ({
        ...returnItem,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setReturnedItems(Array.isArray(newData) ? newData : []);

      setReturnsPagination({
        total: responseData?.total || 0,
        perPage: responseData?.per_page || 25,
        currentPage: responseData?.current_page || 1,
        lastPage: responseData?.last_page || 1,
        from: responseData?.from || 0,
        to: responseData?.to || 0,
      });

      setReturnsLoading(false);
    } catch (error) {
      console.error("Fetch returned items error:", error);
      setReturnsLoading(false);
      toast.error("Failed to load returned items");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const itemOnChange = (e, value) => {
    setItem(value);
  };

  const transferItemOnChange = (e, value) => {
    setTransferItem(value);
  };

  const returnItemOnChange = (e, value) => {
    setReturnItem(value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 25);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleTransferChangePage = (event, newPage) => {
    setTransfersPage(newPage + 1);
  };

  const handleTransferChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 25);
    setTransfersRowsPerPage(newRowsPerPage);
    setTransfersPage(1);
  };

  const handleReturnChangePage = (event, newPage) => {
    setReturnsPage(newPage + 1);
  };

  const handleReturnChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 25);
    setReturnsRowsPerPage(newRowsPerPage);
    setReturnsPage(1);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
  };

  const handleTransferClick = (transfer) => {
    setSelectedTransfer(transfer);
  };

  const handleReturnClick = (returnItem) => {
    setSelectedReturn(returnItem);
  };

  const prepareExportData = (data) => {
    const exportRows = [];

    data.forEach((production) => {
      if (
        production.production_items &&
        production.production_items.length > 0
      ) {
        production.production_items.forEach((item) => {
          exportRows.push({
            "Production ID": production.Production_ID,
            "Production Date": formatDateForDb(production.Production_Date),
            "Employee Name": capitalize(production.employee?.name),
            "Item Name": item.item?.Item_Name,
            Quantity: item.Production_Quantity,
            "Created At": formatDateTimeForDb(production.created_at),
            "Updated At": formatDateTimeForDb(production.updated_at),
          });
        });
      } else {
        exportRows.push({
          "Production ID": production.Production_ID,
          "Production Date": formatDateForDb(production.Production_Date),
          "Employee Name": capitalize(production.employee?.name),
          "Item Name": "No Items",
          Quantity: 0,
          "Created At": formatDateTimeForDb(production.created_at),
          "Updated At": formatDateTimeForDb(production.updated_at),
        });
      }
    });

    return exportRows;
  };

  const exportToExcel = async () => {
    setExportLoading(true);
    toast.loading("Preparing Excel export...", { id: "export" });

    try {
      const exportData = prepareExportData(productions);

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();

      const colWidths = [
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 30 },
        { wch: 15 },
        { wch: 25 },
        { wch: 25 },
      ];
      worksheet["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Oxygen Productions");

      let fileName = "oxygen_productions";
      if (startDate || endDate) {
        const start = startDate ? formatDateForDb(startDate) : "all";
        const end = endDate ? formatDateForDb(endDate) : "all";
        fileName += `_${start}_to_${end}`;
      } else {
        fileName += `_${formatDateForDb(new Date())}`;
      }

      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      toast.success("Excel report downloaded successfully!", { id: "export" });
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to generate Excel report", { id: "export" });
    } finally {
      setExportLoading(false);
      handleMenuClose();
    }
  };

  const exportToPDF = async () => {
    setExportLoading(true);
    toast.loading("Preparing PDF export...", { id: "export" });

    try {
      const exportData = prepareExportData(productions);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(18);
      doc.setTextColor(26, 26, 46);
      doc.text("Oxygen Productions Report", 14, 15);

      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      let subtitle = `Generated on: ${formatDateTimeForDb(new Date())}`;
      if (startDate || endDate) {
        const start = startDate ? formatDateForDb(startDate) : "Start";
        const end = endDate ? formatDateForDb(endDate) : "End";
        subtitle += ` | Date Range: ${start} - ${end}`;
      }
      doc.text(subtitle, 14, 25);

      const totalProductions = [
        ...new Set(exportData.map((row) => row["Production ID"])),
      ].length;
      const totalItems = exportData.reduce(
        (sum, row) => sum + (row["Quantity"] || 0),
        0,
      );

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(`Total Productions: ${totalProductions}`, 14, 35);
      doc.text(`Total Items Produced: ${totalItems}`, 80, 35);

      const tableColumns = [
        "Production ID",
        "Production Date",
        "Employee Name",
        "Item Name",
        "Quantity",
        "Created At",
      ];
      const tableRows = exportData.map((row) => [
        row["Production ID"],
        row["Production Date"],
        row["Employee Name"],
        row["Item Name"],
        row["Quantity"].toString(),
        row["Created At"],
      ]);

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 42,
        theme: "striped",
        headStyles: {
          fillColor: [26, 26, 46],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { cellWidth: 55 },
          4: { cellWidth: 20, halign: "right" },
          5: { cellWidth: 40 },
        },
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${currentPage} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" },
          );
        },
      });

      let fileName = "oxygen_productions_report";
      if (startDate || endDate) {
        const start = startDate ? formatDateForDb(startDate) : "all";
        const end = endDate ? formatDateForDb(endDate) : "all";
        fileName += `_${start}_to_${end}`;
      } else {
        fileName += `_${formatDateForDb(new Date())}`;
      }

      doc.save(`${fileName}.pdf`);
      toast.success("PDF report downloaded successfully!", { id: "export" });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to generate PDF report: " + error.message, {
        id: "export",
      });
    } finally {
      setExportLoading(false);
      handleMenuClose();
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  React.useEffect(() => {
    loadItems();
  }, []);

  const productionsColumns = React.useMemo(() => {
    return [
      { id: "key", label: "S/N" },
      {
        id: "production_items",
        label: "Produced Items (Units)",
        format: (value, row) => {
          if (!row.production_items || !Array.isArray(row.production_items)) {
            return <span className="text-gray-400">No items</span>;
          }

          return (
            <div className="flex flex-col">
              <div className="text-sm">
                {row?.production_items?.map((prodItem, idx) => (
                  <div key={idx}>
                    • {prodItem.item?.Item_Name}:{" "}
                    {formatter.format(Number(prodItem.Production_Quantity))}
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: "Production_Date",
        label: "Date",
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      {
        id: "employees",
        label: "Employee",
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

  const returnsColumns = React.useMemo(() => {
    return [
      { id: "key", label: "S/N" },
      {
        id: "ShiftedItem",
        label: "Rejected Items (Units)",
        format: (value, row) => {
          if (!row.rejectedItem || !Array.isArray(row.rejectedItem)) {
            return <span className="text-gray-400">No items</span>;
          }

          return (
            <div className="flex flex-col">
              <div className="text-sm">
                {row?.rejectedItem?.map((prodItem, idx) => (
                  <div key={idx}>
                    • {prodItem?.item?.Item_Name}:{" "}
                    {formatter.format(Number(prodItem?.Rejected_Quantity || 0))}
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
                Oxygen & Nitrogen Management
              </h1>
              <p className="text-gray-500 text-xs mt-1">
                Manage productions, transfers, and returned items
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {activeTab === 0 && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<MdDownload />}
                  onClick={handleMenuClick}
                  disabled={exportLoading}
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    borderColor: "#cbd5e1",
                    color: "#475569",
                    "&:hover": {
                      borderColor: "#94a3b8",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  {exportLoading ? "Preparing..." : "Export Report"}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<MdSend />}
                  onClick={() =>
                    navigate("/projects/oxygen/productions/send-to-sales")
                  }
                  sx={{
                    backgroundColor: "#16A34A",
                    "&:hover": { backgroundColor: "#059669" },
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "10px",
                    px: 3,
                  }}
                >
                  Send to Sales
                </Button>
                <Button
                  variant="contained"
                  startIcon={<MdAdd />}
                  onClick={() => navigate("/projects/oxygen/productions/new")}
                  sx={{
                    backgroundColor: "#1F4389",
                    "&:hover": { backgroundColor: "#07286f" },
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "10px",
                    px: 3,
                  }}
                >
                  Create Production
                </Button>
              </>
            )}
            {activeTab === 1 && (
              <Button
                variant="contained"
                startIcon={<MdSend />}
                onClick={() =>
                  navigate("/projects/oxygen/productions/send-to-sales")
                }
                sx={{
                  backgroundColor: "#16A34A",
                  "&:hover": { backgroundColor: "#059669" },
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  px: 3,
                }}
              >
                Transfer to Sales
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
          aria-label="oxygen management tabs"
        >
          <Tab
            label="Productions"
            icon={<MdAddChart />}
            iconPosition="start"
            sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
          />
          <Tab
            label="Transfers"
            icon={<MdSwapHoriz />}
            iconPosition="start"
            sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
          />
          <Tab
            label="Returned Items"
            icon={<MdAssignmentReturn />}
            iconPosition="start"
            sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
          />
        </Tabs>
      </div>

      {/* Productions Tab */}
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
              id="combo-box-demo"
              options={items}
              size="small"
              freeSolo
              className={`w-[25%]`}
              value={item}
              onChange={itemOnChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Item" />
              )}
            />
            <TextField
              size="small"
              id="outlined-basic"
              label={"Employee Name"}
              variant="outlined"
              className="w-[25%]"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              autoFocus
            />
          </div>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {productionsColumns.map((column) => (
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
                        colSpan={productionsColumns.length}
                        sx={{ padding: 0 }}
                      >
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {productions?.map((row) => {
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
                        {productionsColumns
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

      {/* Transfers Tab */}
      {activeTab === 1 && (
        <>
          <div className="w-full py-2 flex gap-2 mb-1">
            <DatePick
              label="Start Date"
              value={transferStartDate}
              onChange={(newValue) => setTransferStartDate(newValue)}
              className="w-[25%]"
            />
            <DatePick
              label="End Date"
              value={transferEndDate}
              onChange={(newValue) => setTransferEndDate(newValue)}
              className="w-[25%]"
            />
            <Autocomplete
              id="transfer-item"
              options={items}
              size="small"
              freeSolo
              className="w-[25%]"
              value={transferItem}
              onChange={transferItemOnChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Item" />
              )}
            />
            <TextField
              size="small"
              label="To Location"
              variant="outlined"
              className="w-[25%]"
              value={transferToLocation}
              onChange={(e) => setTransferToLocation(e.target.value)}
            />
          </div>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="transfers table">
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
                  {transfersLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={transfersColumns.length}
                        sx={{ padding: 0 }}
                      >
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {transfers?.map((transfer) => (
                    <TableRow
                      hover
                      key={transfer.key || transfer.Transfer_ID}
                      onClick={() => handleTransferClick(transfer)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedTransfer?.key === transfer.key
                            ? "rgba(0, 0, 0, 0.04)"
                            : "inherit",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.08)",
                        },
                      }}
                    >
                      {transfersColumns.map((column) => {
                        const value = transfer[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format
                              ? column.format(value, transfer)
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
              rowsPerPageOptions={[25, 50, 100, 500, 1000]}
              component="div"
              count={transferPagination.total}
              rowsPerPage={transfersRowsPerPage}
              page={transfersPage - 1}
              onPageChange={handleTransferChangePage}
              onRowsPerPageChange={handleTransferChangeRowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} of ${count}`
              }
              showFirstButton
              showLastButton
            />
          </Paper>
        </>
      )}

      {/* Returned Items Tab */}
      {activeTab === 2 && (
        <>
          <div className="w-full py-2 flex gap-2 mb-1">
            <DatePick
              label="Start Date"
              value={returnStartDate}
              onChange={(newValue) => setReturnStartDate(newValue)}
              className="w-[25%]"
            />
            <DatePick
              label="End Date"
              value={returnEndDate}
              onChange={(newValue) => setReturnEndDate(newValue)}
              className="w-[25%]"
            />
            <Autocomplete
              id="return-item"
              options={items}
              size="small"
              freeSolo
              className="w-[25%]"
              value={returnItem}
              onChange={returnItemOnChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Item" />
              )}
            />
            <TextField
              size="small"
              label="Reason"
              variant="outlined"
              className="w-[25%]"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
          </div>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="returned items table">
                <TableHead>
                  <TableRow>
                    {returnsColumns.map((column) => (
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
                  {returnsLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={returnsColumns.length}
                        sx={{ padding: 0 }}
                      >
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {returnedItems?.map((returnItem) => (
                    <TableRow
                      hover
                      key={returnItem.key || returnItem.Return_ID}
                      onClick={() => handleReturnClick(returnItem)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedReturn?.key === returnItem.key
                            ? "rgba(0, 0, 0, 0.04)"
                            : "inherit",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.08)",
                        },
                      }}
                    >
                      {returnsColumns.map((column) => {
                        const value = returnItem[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format
                              ? column.format(value, returnItem)
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
              rowsPerPageOptions={[25, 50, 100, 500, 1000]}
              component="div"
              count={returnsPagination.total}
              rowsPerPage={returnsRowsPerPage}
              page={returnsPage - 1}
              onPageChange={handleReturnChangePage}
              onRowsPerPageChange={handleReturnChangeRowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} of ${count}`
              }
              showFirstButton
              showLastButton
            />
          </Paper>
        </>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={exportToExcel}>
          <ListItemIcon>
            <MdGridOn className="text-green-600" size={20} />
          </ListItemIcon>
          <ListItemText primary="Export to Excel" secondary=".xlsx format" />
        </MenuItem>
        <MenuItem onClick={exportToPDF}>
          <ListItemIcon>
            <MdPictureAsPdf className="text-red-600" size={20} />
          </ListItemIcon>
          <ListItemText primary="Export to PDF" secondary=".pdf format" />
        </MenuItem>
      </Menu>
    </>
  );
}
