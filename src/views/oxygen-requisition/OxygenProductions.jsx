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
import Badge from "../../components/Badge";
import {
  capitalize,
  currencyFormatter,
  formatDateForDb,
  formatDateTimeForDb,
  formatter,
} from "../../../helpers";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { MdAdd, MdSend } from "react-icons/md";
import { Autocomplete, TextField, Checkbox } from "@mui/material";
import DatePick from "../../components/DatePicker";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function OxygenProductions({ status }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [productions, setProductions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [item, setItem] = React.useState("");
  const [employee, setEmployee] = React.useState("");

  const [employees, setEmployees] = React.useState([]);
  const [items, setItems] = React.useState([]);

  const navigate = useNavigate();

  // Fetch hostels from API
  React.useEffect(() => {
    loadData();
  }, [startDate, endDate, item, employee]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/oxygen/production?`;

      if (startDate) {
        url += `&Start_Date=${formatDateForDb(startDate)}`;
      }

      if (endDate) {
        url += `&End_Date=${formatDateForDb(endDate)}`;
      }

      if (item) {
        url += `&Item_ID=${item?.Item_ID}`;
      }

      if (employee) {
        url += `&Employee_ID=${employee?.Employee_ID}`;
      }

      const response = await apiClient.get(url);

      if (!response.ok) {
        setLoading(false);
        toast.error(
          response.data?.error || "Failed to fetch production details"
        );
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(
          response.data.error || "Failed to fetch production details"
        );
        return;
      }

      // Adjust based on your API response structure
      const itemData = response?.data?.data?.data;
      const newData = itemData?.map((item, index) => ({
        ...item,
        key: index + 1,
      }));
      // console.log(newData);
      setProductions(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch production details error:", error);
      setLoading(false);
      toast.error("Failed to load production details");
    }
  };

  const itemOnChange = (e, value) => {
    setItem(value);
  };

  const employeeOnChange = (e, value) => {
    setEmployee(value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRowClick = (row) => {
    console.log(status);
    setSelectedRow(row);
  };

  const loadItems = async () => {
    try {
      const response = await apiClient.get(`/settings/item?Item_Type=oxygen`);

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      // Adjust based on your API response structure
      const itemData = response?.data?.data;
      const newData = itemData?.map((item, index) => ({
        id: item.Item_ID,
        label: item.Item_Name,
        key: index + 1,
        ...item,
      }));
      setItems(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  React.useEffect(() => {
    loadItems();
  }, []);

  // Inside the Hostels component, replace the columns definition with:
  const columns = React.useMemo(() => {
    return [
      { id: "key", label: "S/N" },
      {
        id: "production_items",
        label: "Produced Items (Units)",
        format: (value, row) => {
          if (!row.production_items || !Array.isArray(row.production_items)) {
            return <span className="text-gray-400">No items</span>;
          }

          const totalItems = row.production_items.length;
          const totalQuantity = row.production_items.reduce(
            (sum, item) => sum + Number(item.Production_Quantity),
            0
          );

          return (
            <div className="flex flex-col">
              <div className="text-sm">
                {row.production_items.map((prodItem, idx) => (
                  <div key={idx}>
                    • {prodItem.item?.Item_Name}:{" "}
                    {formatter.format(Number(prodItem.Production_Quantity))}
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: "Production_Date",
        label: "Date",
        format: (value) => <span>{formatDateForDb(value)}</span>,
      },
      {
        id: "employees",
        label: "Employee",
        format: (row, value) => (
          <span>{capitalize(value?.employee?.name)}</span>
        ),
      },
      {
        id: "created_at",
        label: "Created At",
        format: (value) => <span>{formatDateTimeForDb(value)}</span>,
      },
      //   {
      //     id: "actions",
      //     label: "Actions",
      //     align: "center",
      //     format: (value, row) => (
      //       <div className="flex gap-4 justify-center">
      //         <Checkbox
      //           checked={isRowSelected(row)}
      //           onChange={(e) => handleCheckboxChange(row, e.target.checked)}
      //           color="primary"
      //         />
      //       </div>
      //     ),
      //   },
    ];
  }, [status]);

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <h4>Productions List</h4>
          <div className="flex gap-2">
            <div
              onClick={() =>
                navigate("/projects/oxygen/productions/send-to-sales")
              }
              className="h-10 w-52 bg-green-600 cursor-pointer rounded-xl flex flex-row gap-2 justify-center items-center text-white"
            >
              <MdSend className="text-lg" />
              <p>Send to Sales</p>
            </div>
            <div
              onClick={() => navigate("/projects/oxygen/productions/new")}
              className="h-10 w-52 bg-oceanic cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
            >
              <MdAdd className="my-3" />{" "}
              <p className="py-2">Create Production</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-2 flex gap-2 mb-1">
        <DatePick
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          className="w-[25%]"
        />
        <DatePick
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          className="w-[25%]"
        />
        <Autocomplete
          id="combo-box-demo"
          options={items}
          size="small"
          freeSolo
          className={`w-[25%]`}
          value={item}
          onChange={itemOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Item" />
          )}
        />
        <Autocomplete
          id="combo-box-demo"
          options={employees}
          size="small"
          freeSolo
          className={`w-[25%]`}
          value={employee}
          onChange={employeeOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Employee" />
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
              {productions
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.key || row.id}
                      onClick={() =>
                        status === "student_accomodation" ||
                        status === "student_accomodatio"
                          ? handleRowClick(row)
                          : null
                      }
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
                          (e) => typeof e.show === "undefined" || !!e.show
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
          count={productions?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
