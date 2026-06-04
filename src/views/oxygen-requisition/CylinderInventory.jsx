import React, { useState, useEffect } from "react";
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
import {
  Button,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { FaFileExport, FaUndo } from "react-icons/fa";
import {
  MdLocalShipping,
  MdBuild,
  MdWarning,
  MdOutlinePropaneTank,
  MdGasMeter,
  MdArrowBack,
} from "react-icons/md";
import apiClient from "../../api/Client";
import {
  formatter,
  capitalize,
  currencyFormatter,
  formatDateTimeForDb,
} from "../../../helpers";
import Breadcrumb from "../../components/Breadcrumb";
import Badge from "../../components/Badge";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const CylinderInventory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // State for each tab's data
  const [allOxygenItems, setAllOxygenItems] = useState([]);
  const [displayedOxygenItems, setDisplayedOxygenItems] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [repair, setRepair] = useState([]);
  const [damaged, setDamaged] = useState([]);

  // Return to Production Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnQuantity, setReturnQuantity] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(false);

  // Received transfers state
  const [receivedTransfers, setReceivedTransfers] = useState([]);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // Get employee info from localStorage
  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    if (activeTab === 0 || activeTab === 1) {
      fetchOxygenItems();
    } else if (activeTab === 2) {
      fetchRentals();
    } else if (activeTab === 3) {
      // fetchRepair();
      fetchDamaged();
    } else if (activeTab === 4) {
      fetchDamaged();
    }
  }, [activeTab]);

  // Load rejection reasons when component mounts
  useEffect(() => {
    loadRejectionReasons();
  }, []);

  // Update displayed data when page or rowsPerPage changes
  useEffect(() => {
    if (activeTab === 0 || activeTab === 1) {
      const start = page * rowsPerPage;
      const end = start + rowsPerPage;
      setDisplayedOxygenItems(allOxygenItems.slice(start, end));
    }
  }, [allOxygenItems, page, rowsPerPage, activeTab]);

  const loadRejectionReasons = async () => {
    setLoadingReasons(true);
    try {
      const response = await apiClient.get(
        "/settings/reason?&Project_Type=oxygen",
      );
      if (response.ok && response?.data?.data?.data) {
        const reasons = response?.data?.data?.data?.map((reason) => ({
          Reason_ID: reason?.Reason_ID,
          label: reason?.Reason_Description,
        }));
        setRejectionReasons(reasons);
      }
    } catch (error) {
      console.error("Failed to load rejection reasons:", error);
    } finally {
      setLoadingReasons(false);
    }
  };

  const loadReceivedTransfers = async (item) => {
    setReceivedLoading(true);
    try {
      let url = `/oxygen/shifted-oxygen-item?&Cache_Status=approved&Item_ID=${item?.Item_ID}`;

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

      // Transform the transfer data for autocomplete
      const transformedTransfers = userData.map((transfer) => ({
        id: transfer?.Cache_ID,
        label: `Transfer - ${transfer?.Transaction_Date} - ${transfer?.employee?.name}`,
        ...transfer,
      }));

      setReceivedTransfers(transformedTransfers);
      setReceivedLoading(false);
    } catch (error) {
      console.error("Fetch received transfers error:", error);
      setReceivedLoading(false);
    }
  };

  const fetchOxygenItems = async () => {
    setLoading(true);
    try {
      let url = `/settings/item?Item_Type=oxygen`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        toast.error(response.data?.error || "Failed to fetch oxygen items");
        setLoading(false);
        return;
      }

      // Handle response without pagination
      let itemData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        itemData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        itemData = response.data;
      } else if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        itemData = response.data.data.data;
      } else {
        itemData = [];
      }

      // Transform data for display
      const transformedData = itemData.map((item, index) => {
        // Find production and sales balances
        const productionBalance =
          item.balance?.find((b) => b.Balance_Type === "production")
            ?.Item_Balance || 0;
        const salesBalance =
          item.balance?.find((b) => b.Balance_Type === "sales")?.Item_Balance ||
          0;

        return {
          ...item,
          id: item.Item_ID,
          key: index + 1,
          production_balance: productionBalance,
          sales_balance: salesBalance,
          total_balance: productionBalance + salesBalance,
        };
      });

      setAllOxygenItems(transformedData);
      setPage(0); // Reset to first page when new data arrives
    } catch (error) {
      console.error("Fetch oxygen items error:", error);
      toast.error("Failed to load oxygen items");
    } finally {
      setLoading(false);
    }
  };

  const fetchRentals = async () => {
    setLoading(true);
    try {
      let url = `/oxygen/oxygen-request?Gsf_Quantity=yes`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        toast.error(response.data?.error || "Failed to fetch rentals");
        setLoading(false);
        return;
      }

      // Handle response without pagination
      let rentalsData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        rentalsData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        rentalsData = response.data;
      } else if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        rentalsData = response.data.data.data;
      } else {
        rentalsData = [];
      }

      const transformedData = rentalsData.map((rental, index) => ({
        ...rental,
        id: rental.Rental_ID || rental.id,
        key: index + 1,
      }));

      setRentals(transformedData);
    } catch (error) {
      console.error("Fetch rentals error:", error);
      toast.error("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  const fetchRepair = async () => {
    setLoading(true);
    try {
      let url = `/inventory/repair?status=pending`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        toast.error(response.data?.error || "Failed to fetch repair items");
        setLoading(false);
        return;
      }

      // Handle response without pagination
      let repairData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        repairData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        repairData = response.data;
      } else if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        repairData = response.data.data.data;
      } else {
        repairData = [];
      }

      const transformedData = repairData.map((repairItem, index) => ({
        ...repairItem,
        id: repairItem.Repair_ID || repairItem.id,
        key: index + 1,
      }));

      setRepair(transformedData);
    } catch (error) {
      console.error("Fetch repair error:", error);
      toast.error("Failed to load repair items");
    } finally {
      setLoading(false);
    }
  };

  const fetchDamaged = async () => {
    setLoading(true);
    try {
      let url = `/oxygen/shifted-oxygen-item?Cache_Status=approved&Rejected=yes`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        toast.error(response.data?.error || "Failed to fetch damaged items");
        setLoading(false);
        return;
      }

      // Handle response without pagination
      let damagedData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        damagedData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        damagedData = response.data;
      } else if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        damagedData = response.data.data.data;
      } else {
        damagedData = [];
      }

      const transformedData = damagedData.map((damagedItem, index) => ({
        ...damagedItem,
        id: damagedItem.Damaged_ID || damagedItem.id,
        key: index + 1,
      }));

      setDamaged(transformedData);
    } catch (error) {
      console.error("Fetch damaged error:", error);
      toast.error("Failed to load damaged items");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Handle Return to Production
  const handleOpenReturnModal = async (item) => {
    setSelectedItem(item);
    setReturnQuantity("");
    setReturnReason("");
    setSelectedTransfer(null);
    setReturnModalOpen(true);

    // Load received transfers when opening modal
    await loadReceivedTransfers(item);
  };

  const handleCloseReturnModal = () => {
    setReturnModalOpen(false);
    setSelectedItem(null);
    setReturnQuantity("");
    setReturnReason("");
    setSelectedTransfer(null);
  };

  //   console.log(selectedItem);
  //   console.log(selectedTransfer);

  const handleReturnSubmit = async () => {
    // Validate inputs
    if (!returnQuantity || parseInt(returnQuantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (parseInt(returnQuantity) > selectedItem.sales_balance) {
      toast.error("Return quantity cannot exceed available sales balance");
      return;
    }

    if (!returnReason) {
      toast.error("Please select a reason for return");
      return;
    }

    if (!selectedTransfer) {
      toast.error("Please select a transfer to return items from");
      return;
    }

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setSubmitting(true);
    try {
      // Find the selected reason object to get Reason_ID and description
      const selectedReason = rejectionReasons.find(
        (r) => r.Reason_ID === returnReason,
      );

      // Make API call to reject/return item from sales to production
      const response = await apiClient.post("/oxygen/oxygen-reject-item", {
        Cache_ID: selectedTransfer.Cache_ID || selectedTransfer.id,
        Employee_ID: employeeId,
        items: [
          {
            Item_ID: selectedItem.Item_ID,
            Rejected_Quantity: parseInt(returnQuantity),
            Rejected_Reason_ID: selectedReason?.Reason_ID || returnReason,
          },
        ],
      });

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

          console.log(response);
          if (typeof serverMessage === "string") {
            errorText = serverMessage;
          } else if (
            typeof serverMessage === "object" &&
            serverMessage !== null
          ) {
            errorText = Object.values(serverMessage).flat()[0];
          } else {
            errorText = "Failed to return items to production";
          }

          toast.error(errorText);
        }
        return;
      }

      toast.success(
        `${returnQuantity} units of ${selectedItem?.Item_Name} returned to production successfully`,
      );

      handleCloseReturnModal();
      fetchOxygenItems(); // Refresh the data
    } catch (error) {
      console.error("Return to production error:", error);
      const errorMessage = "Failed to process return to production";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const exportToExcel = () => {
    let data = [];
    switch (activeTab) {
      case 0:
        data = allOxygenItems;
        break;
      case 1:
        data = allOxygenItems;
        break;
      case 2:
        data = rentals;
        break;
      case 3:
        // data = repair;
        data = damaged;
        break;
      case 4:
        data = damaged;
        break;
      default:
        data = allOxygenItems;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Inventory");
    XLSX.writeFile(wb, `Sales_inventory_${Date.now()}.xlsx`);
    toast.success("Export successful");
  };

  const getStatusBadge = (status) => {
    let color = "blue";

    if (status === "active") {
      color = "green";
    } else if (status === "inactive") {
      color = "red";
    }

    return <Badge name={capitalize(status)} color={color} />;
  };

  // Column definitions for each tab
  const salesStockColumns = [
    { id: "key", label: "S/N" },
    { id: "Item_Name", label: "Item Name" },
    {
      id: "production_balance",
      label: "Production Balance",
      format: (value) => formatter.format(Number(value) || 0),
    },
    {
      id: "sales_balance",
      label: "Sales Balance",
      format: (value) => formatter.format(Number(value) || 0),
    },
    {
      id: "Item_Price_Inside",
      label: "Internal Price",
      format: (value) => currencyFormatter.format(value || 0),
    },
    {
      id: "Item_Price_Outside",
      label: "External Price",
      format: (value) => currencyFormatter.format(value || 0),
    },
    {
      id: "Item_Status",
      label: "Status",
      format: (value) => getStatusBadge(value),
    },
    {
      id: "created_at",
      label: "Created At",
      format: (value) => formatDateTimeForDb(value),
    },
    {
      id: "action",
      label: "Action",
      format: (value, row) => {
        // Only show button if sales balance is greater than 0
        if (row.sales_balance > 0) {
          return (
            <Button
              variant="contained"
              size="small"
              startIcon={<FaUndo />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenReturnModal(row);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                backgroundColor: "#1F4389",
                "&:hover": {
                  backgroundColor: "#07286f",
                },
              }}
            >
              Return to Production
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const cylindersColumns = [
    { id: "key", label: "S/N" },
    { id: "Item_Name", label: "Item Name" },
    {
      id: "Gsf_Quantity",
      label: "GSF Cylinders",
      format: (value) => value || 0,
    },
    {
      id: "Item_Status",
      label: "Status",
      format: (value) => getStatusBadge(value),
    },
  ];

  const rentalsColumns = [
    { id: "key", label: "S/N" },
    {
      id: "customer_name",
      label: "Customer Name",
      format: (row, value) => <span>{value?.customer?.Customer_Name}</span>,
    },
    { id: "cylinder", label: "Cylinder" },
    { id: "quantity", label: "Quantity" },
    { id: "rental_start_date", label: "Start Date" },
    { id: "rental_end_date", label: "Returned Date" },
  ];

  const repairColumns = [
    { id: "key", label: "S/N" },
    { id: "cylinder_id", label: "Cylinder ID" },
    { id: "serial_number", label: "Serial Number" },
    { id: "repair_notes", label: "Repair Notes" },
    { id: "reported_date", label: "Reported Date" },
    { id: "estimated_completion", label: "Est. Completion" },
    {
      id: "repair_cost",
      label: "Cost",
      format: (value) => currencyFormatter.format(value || 0),
    },
    { id: "status", label: "Status", format: (value) => getStatusBadge(value) },
  ];

  const damagedColumns = [
    { id: "key", label: "S/N" },
    { id: "cylinder_id", label: "Cylinder ID" },
    { id: "serial_number", label: "Serial Number" },
    { id: "damage_notes", label: "Damage Notes" },
    {
      id: "damage_severity",
      label: "Severity",
      format: (value) => getStatusBadge(value),
    },
    { id: "reported_date", label: "Reported Date" },
    {
      id: "estimated_repair_cost",
      label: "Est. Repair Cost",
      format: (value) => currencyFormatter.format(value || 0),
    },
    { id: "status", label: "Status", format: (value) => getStatusBadge(value) },
  ];

  const getCurrentColumns = () => {
    switch (activeTab) {
      case 0:
        return salesStockColumns;
      case 1:
        return cylindersColumns;
      case 2:
        return rentalsColumns;
      case 3:
        return damagedColumns;
      // return repairColumns;
      case 4:
        return damagedColumns;
      default:
        return salesStockColumns;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 0:
        return displayedOxygenItems;
      case 1:
        return displayedOxygenItems;
      case 2:
        return rentals;
      case 3:
        return damaged;
      // return repair;
      case 4:
        return damaged;
      default:
        return displayedOxygenItems;
    }
  };

  const getTotalCount = () => {
    switch (activeTab) {
      case 0:
        return allOxygenItems.length;
      case 1:
        return allOxygenItems.length;
      case 2:
        return rentals.length;
      case 3:
        return damaged.length;
      // return repair.length;
      case 4:
        return damaged.length;
      default:
        return allOxygenItems.length;
    }
  };

  const columns = getCurrentColumns();
  const currentData = getCurrentData();
  const totalCount = getTotalCount();

  const tabConfig = [
    { label: "Sales Stock", icon: <MdGasMeter /> },
    { label: "Cylinders", icon: <MdOutlinePropaneTank /> },
    { label: "Rentals", icon: <MdLocalShipping /> },
    // { label: "Repair", icon: <MdBuild /> },
    { label: "Damaged", icon: <MdWarning /> },
  ];

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
                Cylinder Inventory Management
              </h1>
              <p className="text-gray-500 text-xs mt-1">
                Manage sales stock, cylinders, rentals, repair, and damaged
                items
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<FaFileExport />}
              onClick={exportToExcel}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                borderColor: "#1F4389",
                color: "#1F4389",
                "&:hover": {
                  borderColor: "#07286f",
                  backgroundColor: "rgba(31, 67, 137, 0.04)",
                },
              }}
            >
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full border-b border-gray-200 mb-4">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="cylinder inventory tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 48,
            },
          }}
        >
          {tabConfig.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </div>

      {/* Data Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="cylinder inventory table">
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
              {currentData?.map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.key || row.Item_ID || row.id}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format
                            ? column.format(value, row)
                            : value || "-"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
              {!loading && currentData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    <div className="py-8 text-gray-500">
                      No {tabConfig[activeTab]?.label?.toLowerCase()} found
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count}`
          }
          showFirstButton
          showLastButton
        />
      </Paper>

      {/* Return to Production Modal */}
      <Dialog
        open={returnModalOpen}
        onClose={handleCloseReturnModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <p className="text-xl font-semibold">Return to Production</p>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Item:</strong> {selectedItem.Item_Name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Available Sales Balance:{" "}
                <strong>{formatter.format(selectedItem.sales_balance)}</strong>
              </Typography>

              {/* Transfer Selection Autocomplete */}
              <Autocomplete
                fullWidth
                options={receivedTransfers}
                value={selectedTransfer}
                onChange={(event, newValue) => {
                  setSelectedTransfer(newValue);
                  // Reset quantity when transfer changes
                  setReturnQuantity("");
                }}
                loading={receivedLoading}
                loadingText="Loading transfers..."
                noOptionsText="No approved transfers found"
                getOptionLabel={(option) => option.label || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Transfer"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {receivedLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Transfer - {option?.Transaction_Date} -{" "}
                        {option?.employee?.name}
                      </Typography>
                    </Box>
                  </Box>
                )}
                sx={{ mt: 2, mb: 2 }}
              />

              <TextField
                fullWidth
                label="Quantity to Return"
                type="number"
                value={returnQuantity}
                onChange={(e) => {
                  const value = e.target.value;
                  const maxAllowed = selectedItem?.sales_balance;

                  if (value === "" || parseInt(value) <= maxAllowed) {
                    setReturnQuantity(value);
                  } else {
                    toast.error(`Quantity cannot exceed ${maxAllowed} units`);
                  }
                }}
                InputProps={{
                  inputProps: {
                    min: 1,
                    max: selectedItem.sales_balance,
                  },
                }}
                sx={{ mt: 2, mb: 2 }}
                helperText={`Maximum: ${selectedItem.sales_balance} units`}
                required
                disabled={!selectedTransfer}
              />

              <FormControl fullWidth required>
                <InputLabel id="return-reason-label">
                  Reason for Return
                </InputLabel>
                <Select
                  labelId="return-reason-label"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  label="Reason for Return"
                  disabled={loadingReasons}
                  startAdornment={
                    loadingReasons ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null
                  }
                >
                  {loadingReasons ? (
                    <MenuItem disabled>
                      <em>Loading reasons...</em>
                    </MenuItem>
                  ) : rejectionReasons.length > 0 ? (
                    rejectionReasons.map((reason) => (
                      <MenuItem key={reason.Reason_ID} value={reason.Reason_ID}>
                        {reason.label}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <em>No reasons available</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseReturnModal}
            variant="outlined"
            sx={{ textTransform: "none" }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReturnSubmit}
            variant="contained"
            disabled={
              !returnQuantity ||
              !returnReason ||
              !selectedTransfer ||
              submitting ||
              parseInt(returnQuantity) <= 0 ||
              loadingReasons
            }
            sx={{
              textTransform: "none",
              backgroundColor: "#1F4389",
              "&:hover": {
                backgroundColor: "#07286f",
              },
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Processing...
              </>
            ) : (
              "Confirm Return"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CylinderInventory;
