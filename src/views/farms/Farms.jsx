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
import {
  currencyFormatter,
  formatDateTimeForDb,
  formatter,
} from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { capitalize } from "lodash";
import Badge from "../../components/Badge";
import AddFarm from "./AddFarm";
import EditFarm from "./EditFarm";

// Add these Material-UI dialog imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function Farms() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [farms, setFarms] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [farmToFree, setFarmToFree] = React.useState(null);
  const [farmToFreeName, setFarmToFreeName] = React.useState("");

  const navigate = useNavigate();

  const hasFetchedData = React.useRef(false);

  React.useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadData();
    }
  }, []);

  // Open confirmation dialog
  const openDialog = (farmId, farmName) => {
    setFarmToFree(farmId);
    setFarmToFreeName(farmName);
    setDialogOpen(true);
  };

  // Close confirmation dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setFarmToFree(null);
    setFarmToFreeName("");
  };

  // Handle free up farm after confirmation
  const handleFreeUpFarmPlots = async () => {
    if (!farmToFree) return;

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    try {
      const response = await apiClient.post(`/estate/offset-farm`, {
        Item_ID: [farmToFree],
        Employee_ID: employeeId,
      });

      // Check if request was successful
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
            errorText = "Failed to free up farm plots";
          }

          toast.error(errorText);
        }
        return;
      }

      toast.success("Farm plots free up successfully");
      loadData(); // Reload data to update UI (preserves current page)
    } catch (error) {
      console.error("Free up farm plots error:", error);
      toast.error("Failed to free up farm plots");
    } finally {
      closeDialog();
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/settings/item?Item_Type=farm`);

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch farms");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch farms");
        return;
      }

      // Adjust based on your API response structure
      const farmsData = response?.data?.data;
      const newData = farmsData?.map((farm, index) => ({
        ...farm,
        key: index + 1,
      }));
      // console.log(newData);
      setFarms(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch farms error:", error);
      setLoading(false);
      toast.error("Failed to load farms");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Inside the users component, replace the columns definition with:
  const columns = React.useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "Item_Name",
        label: "Farm Name",
        format: (value) => <span>{value}</span>,
      },
      {
        id: "Farm_Size",
        label: "Total Hectares",
        format: (value) => <span>{formatter.format(value)}</span>,
      },
      {
        id: "Item_Price",
        label: "Price Per (¼) Hectare",
        format: (value) => <span>{currencyFormatter.format(value)}</span>,
      },
      {
        id: "Item_Status",
        label: "Status",
        format: (value) => (
          <span>
            <Badge
              name={capitalize(value)}
              color={
                value === "active"
                  ? "green"
                  : value === "pending"
                    ? "blue"
                    : "red"
              }
            />
          </span>
        ),
      },
      {
        id: "plotss",
        label: "Occupied Plots",
        format: (value, row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDialog(row?.Item_ID, row?.Item_Name);
            }}
            className="flex h-8 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-1.5 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Free Up Plots
          </button>
        ),
      },
      {
        id: "created_at",
        label: "Created At",
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      {
        id: "actions",
        label: "Actions",
        align: "center",
        format: (value, row) => (
          <div className="flex gap-2 justify-center">
            <EditFarm farm={row} loadData={loadData} />
          </div>
        ),
      },
    ],
    [loadData],
  ); // Add loadData as dependency

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <h4>Farms List</h4>
          <AddFarm loadData={loadData} />
        </div>
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
              {farms
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
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
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={farms?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* free up occupied farm confirmation dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        aria-labelledby="delete-image-dialog-title"
        aria-describedby="delete-image-dialog-description"
      >
        <DialogTitle id="delete-image-dialog-title">
          Free Up Occupied Farm Plots Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-image-dialog-description">
            Are you sure you want to free up occupied plots on "{farmToFreeName}
            "? <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleFreeUpFarmPlots}
            color="success"
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
