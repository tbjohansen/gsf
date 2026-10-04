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
import { formatDateTimeForDb } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import { capitalize } from "lodash";
import Badge from "../../components/Badge";
import Breadcrumb from "../../components/Breadcrumb";
import { Button, IconButton, TextField } from "@mui/material";
import { MdArrowBack } from "react-icons/md";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function PendingApprovals({ status }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();

  // Fetch hostels from API
  useEffect(() => {
    loadData();
  }, [name, customerID, phoneNumber, rowsPerPage, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/request-access?&limit=${rowsPerPage}&page=${page}`;

      if (name) {
        url += `&Customer_Name=${name}`;
      }

      if (customerID) {
        url += `&Student_ID=${customerID}`;
      }

      if (phoneNumber) {
        url += `&Phone_Number=${phoneNumber}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch students");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch students");
        return;
      }

      const userData = response?.data;
      const newData = userData?.map((user, index) => ({
        ...user,
        key: index + 1,
      }));

      setUsers(Array.isArray(newData) ? newData : []);

      setLoading(false);
    } catch (error) {
      console.error("Fetch customers error:", error);
      setLoading(false);
      toast.error("Failed to fetch students");
    }
  };

  const handleApprove = async (row) => {
    const accessId = row.access_ID || row.access_id || row.id;
    if (!accessId) {
      toast.error("Access ID not found for this request");
      return;
    }

    setApprovingId(accessId);
    try {
      const response = await apiClient.put(`/request-access/${accessId}`);

      if (!response.ok || response.data?.error || response.data?.code >= 400) {
        toast.error(response.data?.error || "Failed to approve access request");
        return;
      }

      // Update the row's status locally and remove the button
      setUsers((prev) =>
        prev.map((user) =>
          (user.access_ID || user.access_id || user.id) === accessId
            ? { ...user, status: "approved", _approved: true }
            : user,
        ),
      );

      toast.success("Access request approved successfully");
    } catch (error) {
      console.error("Approve access request error:", error);
      toast.error("Failed to approve access request");
    } finally {
      setApprovingId(null);
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
  const columns = useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "student_name",
        label: "Student Name",
        minWidth: 170,
        format: (row, value) => <div>{value}</div>,
      },
      {
        id: "gender",
        label: "Gender",
        format: (row, value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "phone_number",
        label: "Phone",
        format: (row, value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "email",
        label: "Email",
        format: (row, value) => <span>{value}</span>,
      },
      {
        id: "student_id",
        label: "Student ID",
        minWidth: 170,
        format: (row, value) => <span>{value}</span>,
      },
      {
        id: "Program_Study",
        label: "Program",
        format: (row, value) => <span>{value}</span>,
      },
      {
        id: "Year_Study",
        label: "Year",
        format: (row, value) => <span>{value}</span>,
      },
      {
        id: "status",
        label: "Status",
        format: (row, value) => (
          <Badge
            name={capitalize(value)}
            color={value === "pending" ? "error" : "green"}
          />
        ),
      },
      {
        id: "created_at",
        label: "Created At",
        minWidth: 170,
        format: (row, value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      {
        id: "action",
        label: "Action",
        minWidth: 170,
        format: (row, value) => {
          const isApproved =
            row._approved || row.status?.toLowerCase() === "approved";

          if (isApproved) {
            return null;
          }

          const accessId = row.access_ID || row.access_id || row.id;

          return (
            <button
              className="flex w-[80%] h-10 justify-center cursor-pointer rounded-md bg-oceanic px-3 py-2 text-white shadow-xs hover:bg-blue-zodiac-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={approvingId === accessId}
              onClick={() => handleApprove(row)}
              sx={{ textTransform: "none" }}
            >
              {approvingId === accessId ? "Approving..." : "Approve"}
            </button>
          );
        },
      },
    ],
    [approvingId],
  );

  return (
    <>
      <Breadcrumb />
      <div className="w-full">
        <div className="flex flex-row gap-4 mb-1">
          <IconButton
            onClick={() => navigate(-1)}
            className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <MdArrowBack />
          </IconButton>
          <h4 className="my-2">Pending Access Requests</h4>
        </div>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <TextField
          size="small"
          id="outlined-basic"
          label={"Name"}
          variant="outlined"
          className="w-[33%]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <TextField
          size="small"
          id="outlined-basic"
          label={"Student ID"}
          variant="outlined"
          className="w-[33%]"
          value={customerID}
          onChange={(e) => setCustomerID(e.target.value)}
          autoFocus
        />
        <TextField
          size="small"
          id="outlined-basic"
          label="Phone Number"
          variant="outlined"
          className="w-[33%]"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          autoFocus
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
              {users
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.key || row.id}
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
                              if (column.id === "action") {
                                e.stopPropagation();
                              }
                            }}
                          >
                            {column.format ? column.format(row, value) : value}
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
          count={users?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
