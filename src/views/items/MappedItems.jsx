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

export default function MappedItems() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [mappedItems, setMappedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [hostels, setHostels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [hostel, setHostel] = useState("");
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [roomType, setRoomType] = useState("");

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
  }, [rowsPerPage, page, hostel, block, room, floor, roomType]);

  const sortedRoomTypes = [
    {
      id: "single",
      label: "Single",
    },
    {
      id: "shared",
      label: "Shared",
    },
  ];

  const roomTypeOnChange = (e, value) => {
    setRoomType(value);
  };

  const sortedHostels = hostels?.map((hostel) => ({
    id: hostel?.Hostel_ID,
    label: hostel?.Hostel_Name,
    data: hostel,
  }));

  const hostelOnChange = (e, value) => {
    setHostel(value);
    setBlock("");
    setFloor("");
    // setRoomType("");
    // setSelectedRooms([]);
    setRooms([]);
  };

  const sortedBlocks = blocks?.map((block) => ({
    id: block?.Block_ID,
    label: block?.Block_Name,
    data: block,
  }));

  const blockOnChange = (e, value) => {
    setBlock(value);
    setFloor("");
    // setRoomType("");
    // setSelectedRooms([]);
    setRooms([]);
  };

  const sortedFloors = floors?.map((floor) => ({
    id: floor?.Flow_ID,
    label: `${floor?.Flow_Name} - ${floor?.wing?.Wing_Name} - ${floor?.wing?.Wing_Gender}`,
    data: floor,
  }));

  const floorOnChange = (e, value) => {
    setFloor(value);
    // setRoomType("");
    // setSelectedRooms([]);
    setRooms([]);
  };

  const sortedRooms = rooms?.map((room) => ({
    id: room?.Room_ID,
    label: room?.Room_Name,
    data: room,
  }));

  const roomOnChange = (e, value) => {
    setRoom(value);
    // setRoomType("");
  };

  const loadHostels = async () => {
    try {
      const response = await apiClient.get("/settings/hostel");

      // Check if request was successful
      if (!response.ok) {
        return;
      }

      // Adjust based on your API response structure
      const hostelData = response?.data?.data;
      const newData = hostelData?.map((hostel, index) => ({
        ...hostel,
        key: index + 1,
      }));
      // console.log(newData);
      setHostels(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch hostels error:", error);
    }
  };

  const loadBlocks = async () => {
    if (!hostel?.id) return;
    try {
      const response = await apiClient.get(`/settings/block`, {
        Hostel_ID: hostel?.id,
      });

      if (!response.ok) {
        return;
      }

      // Adjust based on your API response structure
      const blockData = response?.data?.data;
      const newData = blockData?.map((block, index) => ({
        ...block,
        key: index + 1,
      }));
      // console.log(newData);
      setBlocks(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch blocks error:", error);
    }
  };

  const loadFloors = async () => {
    if (!block?.id) return;

    try {
      const response = await apiClient.get("/settings/flow", {
        Block_ID: block?.id,
      });

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      const floorData = response?.data?.data;
      const newData = floorData?.map((floor, index) => ({
        ...floor,
        key: index + 1,
      }));
      setFloors(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch floors error:", error);
    }
  };

  const loadRooms = async () => {
    if (!floor?.id) return;
    try {
      const response = await apiClient.get(`/settings/room`, {
        Flow_ID: floor?.id,
      });

      if (!response.ok) {
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        return;
      }

      // Adjust based on your API response structure
      const roomsData = response?.data?.data;
      const newData = roomsData?.map((room, index) => ({
        ...room,
        key: index + 1,
      }));
      // console.log(newData);
      setRooms(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch rooms error:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let url = `/settings/item-price?&limit=${rowsPerPage}&page=${page}`;

      if (roomType) url += `&Room_Type=${roomType?.id}`;
      if (hostel) url += `&Hostel_ID=${hostel?.id}`;
      if (block) url += `&Block_ID=${block?.id}`;
      if (floor) url += `&Flow_ID=${floor?.id}`;
      if (room) url += `&Room_ID=${room?.id}`;

      const response = await apiClient.get(url, {
        Item_ID: itemID,
      });

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
            errorText = "Failed to fetch mapped items";
          }

          toast.error(errorText);
        }
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

  useEffect(() => {
    loadHostels();
  }, []);

  useEffect(() => {
    if (hostel) {
      loadBlocks();
    }
  }, [hostel]);

  useEffect(() => {
    if (block) {
      loadFloors();
    }
  }, [block]);

  useEffect(() => {
    if (floor) {
      loadRooms();
    }
  }, [floor]);

  return (
    <>
      <Breadcrumb />
      <div className="w-full h-12">
        <div className="w-full my-2 flex justify-between">
          <h4>Mapped Items List</h4>
          <MapItem loadData={loadData} />
        </div>
      </div>

      <div className="w-full py-1 flex flex-row gap-2">
        <Autocomplete
          id="hostel-filter"
          options={sortedRoomTypes}
          size="small"
          freeSolo
          className="w-[25%]"
          value={roomType}
          onChange={roomTypeOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Room Type" />
          )}
        />
        <Autocomplete
          id="bank-filter"
          options={sortedHostels}
          size="small"
          freeSolo
          className="w-[25%]"
          value={hostel}
          onChange={hostelOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Hostel" />
          )}
        />
        <Autocomplete
          id="bank-filter"
          options={sortedBlocks}
          size="small"
          freeSolo
          className="w-[25%]"
          value={block}
          onChange={blockOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Block" />
          )}
        />
        <Autocomplete
          id="bank-filter"
          options={sortedFloors}
          size="small"
          freeSolo
          className="w-[25%]"
          value={floor}
          onChange={floorOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Floor" />
          )}
        />
        <Autocomplete
          id="bank-filter"
          options={sortedRooms}
          size="small"
          freeSolo
          className="w-[25%]"
          value={room}
          onChange={roomOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Room" />
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
