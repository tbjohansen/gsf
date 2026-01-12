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
import IconButton from "@mui/material/IconButton";
import { formatDateTimeForDb, formatter } from "../../../helpers";
import apiClient, { baseURL } from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { capitalize } from "lodash";
import Badge from "../../components/Badge";
import AddUnit from "./AddUnit";
import EditUnit from "./EditUnit";
import { MdCloudUpload, MdDelete } from "react-icons/md";

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

const ImageUploadButton = styled("label")({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 12px",
  cursor: "pointer",
  border: "1px solid #ddd",
  borderRadius: "4px",
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
});

export default function Units() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [units, setUnits] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [uploadingImages, setUploadingImages] = React.useState({});
  
  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [imageToDelete, setImageToDelete] = React.useState(null);
  const [imageToDeleteName, setImageToDeleteName] = React.useState("");

  const navigate = useNavigate();

  const hasFetchedData = React.useRef(false);

  React.useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/settings/real-estate");

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch units");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch units");
        return;
      }

      const userData = response?.data?.data?.data;
      const newData = userData?.map((user, index) => ({
        ...user,
        key: index + 1,
      }));
      setUnits(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch units error:", error);
      setLoading(false);
      toast.error("Failed to load units");
    }
  };

  const handleImageUpload = async (event, unitId) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, JPG, or GIF)");
      return;
    }

    // Validate file size (4MB limit as per API)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image size should be less than 4MB");
      return;
    }

    setUploadingImages((prev) => ({ ...prev, [unitId]: true }));

    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("real_estate_id", unitId);
      formData.append("images[]", file);
      formData.append("Employee_ID", employeeId);

      const response = await apiClient.post(
        "/settings/real-estate-images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok || response.data?.error) {
        toast.error(response.data?.error || "Failed to upload image");
        return;
      }

      toast.success("Image uploaded successfully");
      loadData(); // Reload data to get updated image
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [unitId]: false }));
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (imageId, unitName) => {
    setImageToDelete(imageId);
    setImageToDeleteName(unitName);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setImageToDelete(null);
    setImageToDeleteName("");
  };

  // Handle image delete after confirmation
  const handleImageDelete = async () => {
    if (!imageToDelete) return;

    try {
      const response = await apiClient.delete(
        `/settings/real-estate-images/${imageToDelete}`
      );

      if (!response.ok || response.data?.error) {
        toast.error(response.data?.error || "Failed to delete image");
        return;
      }

      toast.success("Image deleted successfully");
      loadData(); // Reload data to update UI
    } catch (error) {
      console.error("Image delete error:", error);
      toast.error("Failed to delete image");
    } finally {
      closeDeleteDialog();
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
    navigate(`/projects/real-estates/units/${row?.id}/assigned-features`);
  };

  const columns = React.useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "name",
        label: "Unit Name",
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "real_estate_type",
        label: "Unit Type",
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "price",
        label: "Price",
        format: (value) => <span>TZS {formatter.format(value || 0)}</span>,
      },
      {
        id: "status",
        label: "Status",
        format: (value) => (
          <Badge
            name={capitalize(value)}
            color={value === "active" ? "green" : "error"}
          />
        ),
      },
      {
        id: "image",
        label: "Image",
        align: "center",
        format: (value, row) => {
          const isUploading = uploadingImages[row.id];
          
          return (
            <div className="flex items-center justify-center gap-2">
              {value?.length > 0 ? (
                // Display image with delete option
                <div className="flex items-center gap-2">
                  <img
                    src={`${baseURL}/${value[0]?.image_path}`}
                    alt={row?.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(value[0]?.id, row?.name);
                    }}
                    title="Delete image"
                  >
                    <MdDelete fontSize="small" />
                  </IconButton>
                </div>
              ) : (
                // Display image uploader
                <ImageUploadButton>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleImageUpload(e, row.id)}
                    disabled={isUploading}
                  />
                  <MdCloudUpload
                    fontSize="small"
                    style={{ marginRight: "4px" }}
                  />
                  <span style={{ fontSize: "12px" }}>
                    {isUploading ? "Uploading..." : "Upload"}
                  </span>
                </ImageUploadButton>
              )}
            </div>
          );
        },
      },
      {
        id: "description",
        label: "Description",
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
            <EditUnit unit={row} loadData={loadData} />
          </div>
        ),
      },
    ],
    [uploadingImages]
  );

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <h4>Real Estate Units</h4>
          <AddUnit loadData={loadData} />
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
              {units
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
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
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            onClick={(e) => {
                              // Prevent click event from bubbling up to the row
                              // when clicking on action buttons or image column
                              if (
                                column.id === "actions" ||
                                column.id === "image"
                              ) {
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
          count={units?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-image-dialog-title"
        aria-describedby="delete-image-dialog-description"
      >
        <DialogTitle id="delete-image-dialog-title">
          Delete Image Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-image-dialog-description">
            Are you sure you want to delete the image for unit "{imageToDeleteName}"? 
            This action can not be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleImageDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}