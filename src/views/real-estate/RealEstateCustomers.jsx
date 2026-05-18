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
import UploadEstatesCustomers from "./UploadEstatesCustomers";
import { Autocomplete, TextField } from "@mui/material";
import Breadcrumb from "../../components/Breadcrumb";
import AddCustomerDetails from "./AddCustomerDetails";
import EditCustomerDetails from "./EditCustomerDetails";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function RealEstateCustomers() {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [customerID, setCustomerID] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [customer_origin, setCustomerOrigin] = React.useState("");
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

  const hasFetchedData = React.useRef(false);

  React.useEffect(() => {
    loadData();
  }, [rowsPerPage, page, name, phoneNumber, customerID, customer_origin]);

  const sortedCustomerType = [
    { id: "inside", label: "Internal (Employee)" },
    { id: "outside", label: "External" },
  ];

  const handleTypeChange = (e, value) => {
    setCustomerOrigin(value?.id);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/customer/customer?&Customer_Nature=house_rent&page=${page}&limit=${rowsPerPage}`;

      if (name) {
        url += `&Customer_Name=${name}`;
      }

      if (customerID) {
        url += `&Customer_ID=${customerID}`;
      }

      if (phoneNumber) {
        url += `&Phone_Number=${phoneNumber}`;
      }

      if (customer_origin) {
        url += `&customer_origin=${customer_origin}`;
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
            errorText = "Failed to fetch customers";
          }

          toast.error(errorText);
        }
        return;
      }

      const responseData = response?.data?.data;
      const userData = responseData?.data || [];

      // Adjust based on your API response structure

      const newData = userData?.map((user, index) => ({
        ...user,
        key:
          (responseData?.current_page - 1) * responseData?.per_page + index + 1,
      }));

      setUsers(Array.isArray(newData) ? newData : []);

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
        label: "Customer Name",
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
        id: "customer_origin",
        label: "Customer Type",
        minWidth: 150,
        format: (value) => (
          <span>{value === "inside" ? "Internal (Employee)" : "External"}</span>
        ),
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
        minWidth: 110,
        align: "center",
        format: (value, row) => (
          <div className="flex gap-4 justify-center">
            <EditCustomerDetails
              customerData={row}
              customerId={row?.Customer_ID}
              loadData={loadData}
            />
          </div>
        ),
      },
    ],
    [loadData],
  );

  return (
    <>
      <Breadcrumb />
      <div className="w-full flex my-2 justify-center">
        <UploadEstatesCustomers />
      </div>
      <div className="w-full mb-2">
        <div className="flex gap-4 justify-end">
          <AddCustomerDetails loadData={loadData} />
        </div>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <TextField
          size="small"
          id="outlined-basic"
          label={"Customer Name"}
          variant="outlined"
          className="w-[25%]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <TextField
          size="small"
          id="outlined-basic"
          label={"Customer ID"}
          variant="outlined"
          className="w-[25%]"
          value={customerID}
          onChange={(e) => setCustomerID(e.target.value)}
          autoFocus
        />
        <TextField
          size="small"
          id="outlined-basic"
          label="Phone Number"
          variant="outlined"
          className="w-[25%]"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          autoFocus
        />
        <Autocomplete
          id="combo-box-demo"
          options={sortedCustomerType}
          size="small"
          className="w-[25%]"
          freeSolo
          value={sortedCustomerType.find(
            (option) => option.id === customer_origin,
          )}
          onChange={handleTypeChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Customer Type" />
          )}
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
  );
}
