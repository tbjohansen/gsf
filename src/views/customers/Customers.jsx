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
import UploadCustomers from "./UploadCustomers";
import AddCustomer from "./AddCustomer";
import Breadcrumb from "../../components/Breadcrumb";
import { TextField } from "@mui/material";
import EditCustomer from "./EditCustomer";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function Customers({ status }) {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [users, setUsers] = React.useState([]);
  const [name, setName] = React.useState("");
  const [customerID, setCustomerID] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const [pagination, setPagination] = React.useState({
    total: 0,
    perPage: 25,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  const navigate = useNavigate();

  // Fetch hostels from API
  React.useEffect(() => {
    loadData();
  }, [status, name, customerID, phoneNumber, rowsPerPage, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer?&page=${page}&limit=${rowsPerPage}`;
      if (status) {
        url += `&Customer_Nature=${status}`;
      }

      if (name) {
        if (status === "student") {
          url += `&Student_Name=${name}`;
        } else {
          url += `&Customer_Name=${name}`;
        }
      }

      if (customerID) {
        if (status === "student") {
          url += `&Student_ID=${customerID}`;
        } else {
          url += `&Customer_ID=${customerID}`;
        }
      }

      if (phoneNumber) {
        url += `&Phone_Number=${phoneNumber}`;
      }

      const response = await apiClient.get(url);

      // Check if request was successful
      if (!response.ok) {
        setLoading(false);

        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          // ✅ Use the server's error message if available
          const serverMessage = response.data?.error || response.data?.message;
          toast.error(
            typeof serverMessage === "string"
              ? serverMessage
              : "Failed to fetch data",
          );
        }
        return;
      }

      // Adjust based on your API response structure
      const responseData = response?.data?.data;
      const userData = responseData?.data;

      // Update customers with keys
      const newData = userData?.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));
      // console.log(newData);
      setUsers(Array.isArray(newData) ? newData : []);

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
      console.error("Fetch customers error:", error);
      setLoading(false);
      toast.error("Failed to load customers");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event?.target?.value, 25);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  // Inside the users component, replace the columns definition with:
  const columns = React.useMemo(
    () => [
      { id: "key", label: "S/N" },
      {
        id: "Customer_Name",
        label: "Name",
        minWidth: 170,
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "Gender",
        label: "Gender",
        show: status !== "oxygen",
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "Nationality",
        label: "Nationality",
        show: status !== "oxygen",
        format: (value) => <span>{capitalize(value)}</span>,
      },
      { id: "Phone_Number", label: "Phone" },
      { id: "Email", label: "Email" },
      {
        id: "Payment_Method",
        label: "Payment",
        show: status === "oxygen",
        minWidth: 110,
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "Student_ID",
        label: `${status === "student" ? "Student ID" : "Customer ID"}`,
        show: status !== "oxygen",
        minWidth: 170,
      },
      { id: "Program_Study", label: "Program", show: status === "student" },
      { id: "Year_Study", label: "Year", show: status === "student" },
      { id: "Semester", label: "Semester", show: status === "student" },
      {
        id: "Admission_ID",
        label: "Admission ID",
        show: status === "student",
        minWidth: 170,
      },
      {
        id: "Customer_Status",
        label: "Status",
        format: (value) => (
          <Badge
            name={capitalize(value)}
            color={value === "active" ? "green" : "error"}
          />
        ),
      },
      {
        id: "created_at",
        label: "Created At",
        minWidth: 170,
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      {
        id: "actions",
        label: "Actions",
        minWidth: 170,
        align: "center",
        format: (value, row) => (
          <div className="flex gap-4 justify-center">
            <EditCustomer customer={row} status={status} loadData={loadData} />
          </div>
        ),
      },
    ],
    [loadData, status],
  );

  return (
    <>
      <Breadcrumb />
      <div className="w-full my-6">
        <div className="w-full">
          <UploadCustomers status={status} loadData={loadData} />
        </div>
        <div className="w-full">
          <div className="flex gap-4 justify-end">
            <AddCustomer loadData={loadData} status={status} />
          </div>
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
          label={status === "student" ? "Student ID" : "Customer ID"}
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
                      typeof column.show === "undefined" || !!column.show,
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
              {users?.map((row) => {
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
                    {columns
                      .filter(
                        (column) =>
                          typeof column.show === "undefined" || !!column.show,
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
