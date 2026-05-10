import { useState, useEffect, useMemo } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { capitalize, formatDateTimeForDb, formatter } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import MapItem from "./MapItem";
import RemoveItem from "./RemoveItem";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function MappedItems() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [mappedItems, setMappedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();
  const { itemID } = useParams();

  // Fetch hostels from API
  useEffect(() => {
    loadData();
  }, [rowsPerPage, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/settings/item-price?&limit=${rowsPerPage}&page=${page}`,
        {
          Item_ID: itemID,
        },
      );

      // console.log(response);

      if (!response.ok) {
        setLoading(false);
        toast.error("Failed to fetch mapped prices");
        return;
      }

      if (response?.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error("Failed to fetch mapped prices");
        return;
      }

      const responseData = response?.data?.data;
      const unitsData = responseData?.data || [];

      const newData = unitsData?.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setMappedItems(Array.isArray(newData) ? newData : []);

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
      console.error("Fetch hostels error:", error);
      setLoading(false);
      toast.error("Failed to load hostels");
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

  const handleRowClick = (row) => {
    setSelectedRow(row);
    console.log("Row clicked:", row);
    // You can add your custom row click logic here
    // For example: navigate to details page, open modal, etc.
    // navigate(`/hostels/${row?.Hostel_ID}`);
  };

  // Inside the Hostels component, replace the columns definition with:
  const columns = useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "Price",
        label: "Price",
        format: (value) => <span>{formatter.format(value)}</span>,
      },
      {
        id: "Natinality",
        label: "Nationality",
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "Room_Type",
        label: "Room Type",
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "hostel",
        label: "Hostel",
        format: (row, value) => (
          <span>{capitalize(value?.room?.hostel?.Hostel_Name)}</span>
        ),
      },
      {
        id: "block",
        label: "Block",
        format: (row, value) => (
          <span>{capitalize(value?.room?.block?.Block_Name)}</span>
        ),
      },
      {
        id: "floor",
        label: "Floor",
        format: (row, value) => (
          <span>{capitalize(value?.room?.flow?.Flow_Name)}</span>
        ),
      },
      {
        id: "room",
        label: "Room",
        format: (value) => <span>{capitalize(value?.Room_Name)}</span>,
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
            <RemoveItem item={row} loadData={loadData} />
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
          <h4>Mapped Items List</h4>
          <MapItem loadData={loadData} />
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
              {mappedItems?.map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.key || row.id}
                    //   onClick={() => handleRowClick(row)}
                    sx={{
                      // cursor: "pointer",
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
