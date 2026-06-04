import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  IconButton,
  Button,
  Grid,
  Box,
  Avatar,
  Stack,
  LinearProgress,
} from "@mui/material";
import {
  MdArrowBack,
  MdPrint,
  MdDownload,
  MdEdit,
  MdDelete,
  MdLocalShipping,
  MdPerson,
  MdCalendarToday,
  MdProductionQuantityLimits,
  MdInventory,
} from "react-icons/md";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import { formatDateForDb, formatDateTimeForDb, formatter, capitalize } from "../../../helpers";
import Breadcrumb from "../../components/Breadcrumb";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#1a1a2e",
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: "0.5px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: "#2c3e50",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#fafafa",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const InfoCard = ({ icon, title, value, subtitle }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2", mr: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" component="div" fontWeight="bold" mb={1}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function ProductionDetails() {
  const { productionID } = useParams();
  const navigate = useNavigate();
  const [production, setProduction] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    fetchProductionDetails();
  }, [productionID]);

  const fetchProductionDetails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/oxygen/production?&Production_ID=${productionID}`);

      if (!response.ok) {
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else {
          toast.error(response?.data?.message || "Failed to fetch production details");
        }
        navigate("/projects/oxygen/productions");
        return;
      }

      const productionData = response?.data?.data;
      setProduction(productionData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching production:", error);
      toast.error("Failed to load production details");
      setLoading(false);
      navigate("/projects/oxygen/productions");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    toast.success("Download started...");
  };

  const handleEdit = () => {
    navigate(`/projects/oxygen/productions/${productionID}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this production record?")) {
      setDeleting(true);
      try {
        const response = await apiClient.delete(`/oxygen/production/${productionID}`);
        
        if (!response.ok) {
          toast.error(response?.data?.message || "Failed to delete production");
          setDeleting(false);
          return;
        }

        toast.success("Production record deleted successfully");
        navigate("/projects/oxygen/productions");
      } catch (error) {
        console.error("Error deleting production:", error);
        toast.error("Failed to delete production");
        setDeleting(false);
      }
    }
  };

  const handleSendToSales = () => {
    navigate(`/projects/oxygen/productions/${productionID}/send-to-sales`, {
      state: { production }
    });
  };

  const calculateTotalQuantity = () => {
    if (!production?.production_items) return 0;
    return production.production_items.reduce(
      (sum, item) => sum + Number(item.Production_Quantity),
      0
    );
  };

  const calculateTotalItems = () => {
    return production?.production_items?.length || 0;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Breadcrumb />
        <Box sx={{ width: "100%", mt: 4 }}>
          <LinearProgress />
        </Box>
      </div>
    );
  }

  if (!production) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Breadcrumb />
        <Paper className="p-8 text-center">
          <Typography variant="h6" color="error">
            Production record not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Back to Productions
          </Button>
        </Paper>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumb />

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <IconButton
              onClick={() => navigate(-1)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
              size="small"
            >
              <MdArrowBack size={20} />
            </IconButton>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Production Details
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Production ID: #{production.Production_ID}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outlined"
              startIcon={<MdPrint />}
              onClick={handlePrint}
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
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<MdDownload />}
              onClick={handleDownload}
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
              Download
            </Button>
            <Button
              variant="contained"
              startIcon={<MdEdit />}
              onClick={handleEdit}
              sx={{
                backgroundColor: "#0f172a",
                "&:hover": { backgroundColor: "#1e293b" },
                textTransform: "none",
                borderRadius: "10px",
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              startIcon={<MdDelete />}
              onClick={handleDelete}
              disabled={deleting}
              sx={{
                backgroundColor: "#ef4444",
                "&:hover": { backgroundColor: "#dc2626" },
                textTransform: "none",
                borderRadius: "10px",
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            icon={<MdProductionQuantityLimits size={24} />}
            title="Total Items Produced"
            value={calculateTotalItems()}
            subtitle="Different product types"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            icon={<MdInventory size={24} />}
            title="Total Quantity"
            value={formatter.format(calculateTotalQuantity())}
            subtitle="Units produced"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            icon={<MdPerson size={24} />}
            title="Employee"
            value={capitalize(production.employee?.name || "N/A")}
            subtitle="Production supervisor"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            icon={<MdCalendarToday size={24} />}
            title="Production Date"
            value={formatDateForDb(production.Production_Date)}
            subtitle="Record created"
          />
        </Grid>
      </Grid>

      {/* Production Items Table */}
      <Paper className="mb-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <Typography variant="h6" className="font-semibold text-gray-800">
            Production Items
          </Typography>
          <Typography variant="body2" className="text-gray-500 mt-1">
            Detailed list of all items produced in this batch
          </Typography>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>S/N</StyledTableCell>
                <StyledTableCell>Item Name</StyledTableCell>
                <StyledTableCell align="right">Production Quantity</StyledTableCell>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell>Created At</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {production.production_items?.map((item, index) => (
                <StyledTableRow key={item.Item_Production_ID}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                          fontSize: "14px",
                        }}
                      >
                        {item.item?.Item_Name?.charAt(0) || "P"}
                      </Avatar>
                      <Typography fontWeight={500}>
                        {item.item?.Item_Name || "Unknown Item"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="primary">
                      {formatter.format(Number(item.Production_Quantity))}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label="Produced"
                      size="small"
                      sx={{
                        backgroundColor: "#10b981",
                        color: "white",
                        fontWeight: 500,
                        "& .MuiChip-label": { px: 2 },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {formatDateTimeForDb(item.created_at)}
                    </Typography>
                  </TableCell>
                </StyledTableRow>
              ))}
              {(!production.production_items ||
                production.production_items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary">
                      No items found in this production
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Additional Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <Typography variant="h6" className="font-semibold text-gray-800">
                Production Information
              </Typography>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <Typography variant="body2" color="textSecondary">
                  Production ID
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  #{production.Production_ID}
                </Typography>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <Typography variant="body2" color="textSecondary">
                  Production Date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDateTimeForDb(production.Production_Date)}
                </Typography>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <Typography variant="body2" color="textSecondary">
                  Employee ID
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {production.employee?.Employee_ID || "N/A"}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body2" color="textSecondary">
                  Employee Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {capitalize(production.employee?.name) || "N/A"}
                </Typography>
              </div>
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <Typography variant="h6" className="font-semibold text-gray-800">
                System Information
              </Typography>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <Typography variant="body2" color="textSecondary">
                  Record Created
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatDateTimeForDb(production.created_at)}
                </Typography>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <Typography variant="body2" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatDateTimeForDb(production.updated_at)}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    backgroundColor: "#10b981",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box className="mt-6 flex justify-end">
        <Button
          variant="contained"
          startIcon={<MdLocalShipping />}
          onClick={handleSendToSales}
          sx={{
            backgroundColor: "#0f172a",
            "&:hover": { backgroundColor: "#1e293b" },
            textTransform: "none",
            borderRadius: "10px",
            px: 4,
            py: 1.5,
          }}
        >
          Send to Sales Department
        </Button>
      </Box>
    </div>
  );
}