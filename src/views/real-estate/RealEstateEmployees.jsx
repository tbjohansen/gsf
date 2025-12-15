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
import { formatDateTimeForDb, formatter } from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { capitalize } from "lodash";
import Badge from "../../components/Badge";
import EditFeature from "./EditFeatures";
import { FcSynchronize } from "react-icons/fc";
import AddEmployee from "./AddEmployee";
import { TextField } from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function RealEstateEmployees() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [employees, setEmployees] = React.useState([]);
  const [name, setName] = React.useState("");
  const [customerID, setCustomerID] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [syncLoading, setSyncLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

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
      let url = `/customer/customer?&Customer_Nature=house_rent`;

      if (name) {
        url += `&Customer_Name=${name}`;
      }

      if (customerID) {
        url += `&Customer_ID=${customerID}`;
      }

      if (phoneNumber) {
        url += `&Phone_Number=${phoneNumber}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        toast.error(response?.data?.error || "Failed to fetch employees");
        return;
      }

      if (response.data?.error || response?.data?.code >= 400) {
        setLoading(false);
        toast.error(response?.data?.error || "Failed to fetch employees");
        return;
      }

      const userData = response?.data?.data?.data || [];

      const employeesArray = [];

      userData.forEach((user, index) => {
        if (user?.Student_ID != null) {
          employeesArray.push(user);
        }
      });

      // Adjust based on your API response structure
      if (employeesArray?.length > 0) {
        const newData = employeesArray?.map((user, index) => ({
          ...user,
          key: index + 1,
        }));
        // console.log(newData);
        setEmployees(Array.isArray(newData) ? newData : []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setLoading(false);
      toast.error("Failed to load employees");
    }
  };

  const onSyncEmployees = async () => {
    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setSyncLoading(true);
    try {
      let url = `/synchronise-employee?&Employee_ID=${employeeId}`;

      const response = await apiClient.get(url);

      if (!response.ok) {
        setSyncLoading(false);
        toast.error(
          response?.data?.error || "Failed to fetch employees from eHMS"
        );
        return;
      }

      if (response.data?.error || response?.data?.code >= 400) {
        setSyncLoading(false);
        toast.error(
          response?.data?.error || "Failed to fetch employees from eHMS"
        );
        return;
      }

      // Adjust based on your API response structure
      const userData = response?.data?.data;

      console.log(userData);
      setSyncLoading(false);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setSyncLoading(false);
      toast.error("Failed to load employees from eHMS");
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
        id: "Customer_Name",
        label: "Employee Name",
        minWidth: 170,
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "Gender",
        label: "Gender",
        format: (value) => <span>{capitalize(value)}</span>,
      },
      {
        id: "Nationality",
        label: "Nationality",
        format: (value) => <span>{capitalize(value)}</span>,
      },
      { id: "Phone_Number", label: "Phone" },
      { id: "Email", label: "Email" },
      {
        id: "Student_ID",
        label: `Employee Number`,
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
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      // {
      //   id: "actions",
      //   label: "Actions",
      //   align: "center",
      //   format: (value, row) => (
      //     <div className="flex gap-2 justify-center">
      //       <EditFeature feature={row} loadData={loadData} />
      //     </div>
      //   ),
      // },
    ],
    []
  );

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12 mb-3">
        <div className="w-full my-2 flex flex-row gap-2">
          <h4 className="w-[50%]">Employees List</h4>
          <div className="w-[50%] flex flex-row justify-between">
            <button
              onClick={() => onSyncEmployees()}
              disabled={syncLoading}
              className="group h-10 w-64 flex justify-center bg-gradient-to-r from-blue-900 to-sky-600 text-white rounded-xl cursor-pointer hover:from-blue-800"
            >
              <div className="flex text-sm items-center text-white gap-2">
                <FcSynchronize className="w-5 h-5" />
                Synchronize Employees
              </div>
            </button>
            <AddEmployee loadData={loadData} />
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
          label={"Employee ID"}
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
              {employees
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
          count={employees?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
