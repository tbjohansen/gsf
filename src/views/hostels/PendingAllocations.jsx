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
import { formatDateTimeForDb } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import { capitalize } from "lodash";
import Badge from "../../components/Badge";
import Breadcrumb from "../../components/Breadcrumb";
import { Autocomplete, TextField } from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function PendingAllocations({ status }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [users, setUsers] = React.useState([]);
  const [name, setName] = React.useState("");
  const [customerID, setCustomerID] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const navigate = useNavigate();

  // Fetch hostels from API
  React.useEffect(() => {
    loadData();
  }, [name, customerID, phoneNumber]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer-request?&Customer_Status=paid&Room_Status=paid&Request_Type=hostel`;

      if (name) {
        url += `&Student_Name=${name}`;
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

      // Adjust based on your API response structure
      const userData = response?.data?.data?.data;
      const newData = userData?.map((user, index) => ({
        ...user,
        key: index + 1,
      }));
      // console.log(newData);
      setUsers(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch customers error:", error);
      setLoading(false);
      toast.error("Failed to fetch students");
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
    navigate(
      `/projects/hostels/pending-room-assignments/${row?.Request_ID}/assign-room`
    );
  };

  // Inside the users component, replace the columns definition with:
  const columns = React.useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "Customer_Name",
        label: "Name",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Customer_Name)}</span>
        ),
      },
      {
        id: "Gender",
        label: "Gender",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Gender)}</span>
        ),
      },
      {
        id: "Nationality",
        label: "Nationality",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Nationality)}</span>
        ),
      },
      {
        id: "Phone_Number",
        label: "Phone",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Phone_Number)}</span>
        ),
      },
      {
        id: "Email",
        label: "Email",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Email)}</span>
        ),
      },
      {
        id: "Student_ID",
        label: "Student ID",
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Student_ID)}</span>
        ),
      },
      {
        id: "Program_Study",
        label: "Program",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Program_Study)}</span>
        ),
      },
      {
        id: "Year_Study",
        label: "Year",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Year_Study)}</span>
        ),
      },
      {
        id: "Semester",
        label: "Semester",
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Semester)}</span>
        ),
      },
      {
        id: "Admission_ID",
        label: "Admission ID",
        minWidth: 170,
        format: (row, value) => (
          <span>{capitalize(value?.customer?.Admission_ID)}</span>
        ),
      },
      {
        id: "Customer_Status",
        label: "Status",
        format: (value) => (
          <Badge
            name={capitalize(value)}
            color={value === "paid" ? "green" : "error"}
          />
        ),
      },
      {
        id: "created_at",
        label: "Created At",
        minWidth: 170,
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
    ],
    [loadData, status]
  );

  return (
    <>
      <Breadcrumb />
      <div className="w-full my-6">
        <h4>Pending Room Assignments</h4>
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
                {columns
                  .filter(
                    (column) =>
                      typeof column.show === "undefined" || !!column.show
                  )
                  .map((column) => (
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
                      {columns
                        .filter(
                          (column) =>
                            typeof column.show === "undefined" || !!column.show
                        )
                        .map((column) => {
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
