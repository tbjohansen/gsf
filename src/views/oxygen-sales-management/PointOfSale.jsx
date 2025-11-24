import React, { useState, useEffect, useMemo } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { MdAdd, MdRemove, MdDeleteForever } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import { formatter } from "../../../helpers";
import Breadcrumb from "../../components/Breadcrumb";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#f5f6fa`,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const PointOfSale = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previousRequests, setPreviousRequests] = useState([]);
  const [loadingPreviousRequests, setLoadingPreviousRequests] = useState(false);

  // Fetch items and customers from API
  useEffect(() => {
    loadItems();
    loadCustomers();
    loadPreviousRequests();
  }, []);

  // Reload previous requests when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      loadPreviousRequests();
    }
  }, [selectedCustomer]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/settings/item?Item_Type=oxygen`);

      if (!response.ok) {
        setLoading(false);
        toast.error(response.data?.error || "Failed to fetch items");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error(response.data.error || "Failed to fetch items");
        return;
      }

      const customerOrigin = localStorage.getItem("customerOrigin");

      const itemData = response?.data?.data;
      const newData = itemData?.map((item, index) => ({
        ...item,
        key: index + 1,
        Item_Price:
          customerOrigin === "inside"
            ? item.Item_Price_Inside
            : item.Item_Price_Outside,
      }));
      setItems(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch items error:", error);
      setLoading(false);
      toast.error("Failed to load items");
    }
  };

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await apiClient.get(
        `/customer/customer?Customer_Nature=oxygen&limit=100&page=1`
      );

      if (response.data?.error || response.data?.code >= 400) {
        setLoadingCustomers(false);
        toast.error(response.data.error || "Failed to fetch customers");
        return;
      }

      if (!response.ok) {
        setLoadingCustomers(false);
        toast.error(response.data?.error || "Failed to fetch customers");
        return;
      }

      const customerData =
        response?.data?.data?.data || response?.data?.data || [];
      const formattedCustomers = customerData.map((customer) => ({
        ...customer,
        id: customer.Customer_ID,
        label: customer.Customer_Name,
      }));
      setCustomers(Array.isArray(formattedCustomers) ? formattedCustomers : []);
      setLoadingCustomers(false);
    } catch (error) {
      console.error("Fetch customers error:", error);
      setLoadingCustomers(false);
      toast.error("Failed to load customers");
    }
  };

  const loadPreviousRequests = async () => {
    // Use selectedCustomer if available, otherwise fall back to localStorage
    const customerId = localStorage.getItem("customerId");
    console.log("customerId", customerId);
    if (!customerId) {
      return;
    }

    setLoadingPreviousRequests(true);
    try {
      const response = await apiClient.get(
        `/oxygen/oxygen-request?Customer_ID=${customerId}&Customer_Status=active`
      );

      if (response.data?.error || response.data?.code >= 400) {
        setLoadingPreviousRequests(false);
        toast.error(response.data.error || "Failed to fetch previous requests");
        return;
      }

      if (!response.ok) {
        setLoadingPreviousRequests(false);
        toast.error(
          response.data?.error || "Failed to fetch previous requests"
        );
        return;
      }

      const requestData =
        response?.data?.data?.data || response?.data?.data || [];
      setPreviousRequests(Array.isArray(requestData) ? requestData : []);
      setLoadingPreviousRequests(false);
    } catch (error) {
      console.error("Fetch previous requests error:", error);
      setLoadingPreviousRequests(false);
      toast.error("Failed to load previous requests");
    }
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    return items.filter((item) =>
      item.Item_Name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Add item to selected items
  const handleAddItem = (item) => {
    const existingItem = selectedItems.find(
      (selected) => selected.Item_ID === item.Item_ID
    );

    if (existingItem) {
      // If item already exists, increase quantity
      setSelectedItems((prev) =>
        prev.map((selected) =>
          selected.Item_ID === item.Item_ID
            ? { ...selected, quantity: selected.quantity + 1 }
            : selected
        )
      );
    } else {
      // Add new item with default quantity of 1
      setSelectedItems((prev) => [
        ...prev,
        {
          ...item,
          quantity: 1,
          price: Number(item.Item_Price) || 0,
        },
      ]);
    }
  };

  // Remove item from selected items
  const handleRemoveItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((item) => item.Item_ID !== itemId));
  };

  // Update quantity
  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = Math.max(0, Number(newQuantity) || 0);
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.Item_ID === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Update price
  const handlePriceChange = (itemId, newPrice) => {
    const price = Math.max(0, Number(newPrice) || 0);
    setSelectedItems((prev) =>
      prev.map((item) => (item.Item_ID === itemId ? { ...item, price } : item))
    );
  };

  // Increase quantity by 1
  const handleIncreaseQuantity = (itemId) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.Item_ID === itemId
          ? { ...item, quantity: (item.quantity || 0) + 1 }
          : item
      )
    );
  };

  // Decrease quantity by 1
  const handleDecreaseQuantity = (itemId) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.Item_ID === itemId
          ? {
              ...item,
              quantity: Math.max(0, (item.quantity || 0) - 1),
            }
          : item
      )
    );
  };

  // Calculate total for a single item
  const calculateItemTotal = (item) => {
    return (item.quantity || 0) * (item.price || 0);
  };

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0
    );
  }, [selectedItems]);

  // Submit order
  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please add at least one item to the order");
      return;
    }

    // Validate that all items have quantity > 0
    const invalidItems = selectedItems.filter(
      (item) => !item.quantity || item.quantity <= 0
    );
    if (invalidItems.length > 0) {
      toast.error("Please ensure all items have a quantity greater than 0");
      return;
    }

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");
    const customerId = localStorage.getItem("customerId");
    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    if (!customerId) {
      toast.error("Customer information not found. Please login again.");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare the request data according to the specified structure
      const requestData = {
        Employee_ID: employeeId,
        Customer_ID: customerId,
        items: selectedItems.map((item) => ({
          Price: item.price,
          Quantity: item.quantity,
          Item_ID: item.Item_ID,
        })),
        Request_Type: "oxygen",
      };

      console.log("Submitting order data:", requestData);

      // Make API request
      const response = await apiClient.post(
        "/oxygen/oxygen-request",
        requestData
      );

      // Check if request was successful
      if (!response.ok) {
        setSubmitting(false);

        // Handle apisauce errors
        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else if (response.problem === "CONNECTION_ERROR") {
          toast.error("Connection error. Please check your internet");
        } else {
          toast.error(response.data?.error || "Failed to submit order");
        }
        return;
      }

      // Check if response contains an error
      if (response.data?.error || response.data?.code >= 400) {
        setSubmitting(false);
        toast.error(response.data?.error || "Failed to submit order");
        return;
      }

      // Success
      setSubmitting(false);
      toast.success("Order submitted successfully!");

      // Clear selected items and customer
      setSelectedItems([]);
      setSelectedCustomer(null);

      // Reload previous requests
      loadPreviousRequests();
    } catch (error) {
      console.error("Submit order error:", error);
      setSubmitting(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  return (
    <>
      <Breadcrumb />
      <div className="w-full my-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Point of Sale
        </h2>

        {/* Customer Selection */}
        {/* <div className="mb-6">
          <Autocomplete
            options={customers}
            loading={loadingCustomers}
            value={selectedCustomer}
            onChange={(event, newValue) => {
              setSelectedCustomer(newValue);
            }}
            getOptionLabel={(option) =>
              option.label || option.Customer_Name || ""
            }
            isOptionEqualToValue={(option, value) =>
              option.Customer_ID === value?.Customer_ID
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Customer"
                variant="outlined"
                size="small"
                required
                placeholder="Search for a customer..."
              />
            )}
            sx={{ maxWidth: 400 }}
          />
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Left Side - Items List */}
          <div className="w-full lg:col-span-2">
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Items
                </h3>
                {/* Search Input */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by Item Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        paddingLeft: "40px",
                      },
                    }}
                  />
                </div>
              </div>

              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader aria-label="items table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Item Name</StyledTableCell>
                      <StyledTableCell align="right">
                        Price (TZS)
                      </StyledTableCell>
                      <StyledTableCell align="center">Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ padding: 0 }}>
                          <LinearProgress />
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredItems.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          {searchQuery
                            ? "No items found matching your search"
                            : "No items available"}
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredItems.map((item) => (
                      <TableRow
                        key={item.Item_ID}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}>
                        <TableCell>{item.Item_Name}</TableCell>
                        <TableCell align="right">
                          {formatter.format(item.Item_Price || 0)}
                        </TableCell>
                        <TableCell align="center">
                          <button
                            onClick={() => handleAddItem(item)}
                            className="w-10 h-10 bg-white cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center group">
                            <MdAdd className="w-6 h-6 text-gray-800 group-hover:text-blue-600 transition-colors" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>

          {/* Right Side - Selected Items Table */}
          <div className="w-full lg:col-span-4">
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  Selected Items
                </h3>
              </div>

              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader aria-label="selected items table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Item Name</StyledTableCell>
                      <StyledTableCell align="center">Quantity</StyledTableCell>
                      <StyledTableCell align="right">
                        Price (TZS)
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        Total (TZS)
                      </StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No items selected. Add items from the list on the
                          left.
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedItems.map((item) => (
                        <TableRow
                          key={item.Item_ID}
                          hover
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}>
                          <TableCell>{item.Item_Name}</TableCell>
                          <TableCell align="center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleDecreaseQuantity(item.Item_ID)
                                }
                                className="w-8 h-8 bg-white cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center group">
                                <MdRemove className="w-4 h-4 text-gray-800 group-hover:text-red-600 transition-colors" />
                              </button>
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity || 0}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.Item_ID,
                                    e.target.value
                                  )
                                }
                                inputProps={{
                                  min: 0,
                                  style: { textAlign: "center", width: "60px" },
                                }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    padding: "4px 8px",
                                  },
                                }}
                              />
                              <button
                                onClick={() =>
                                  handleIncreaseQuantity(item.Item_ID)
                                }
                                className="w-8 h-8 bg-white cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center group">
                                <MdAdd className="w-4 h-4 text-gray-800 group-hover:text-blue-600 transition-colors" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell align="right">
                            {formatter.format(item.price || 0)}
                            {/* <TextField
                              type="number"
                              size="small"
                              value={item.price || 0}
                              onChange={(e) =>
                                handlePriceChange(item.Item_ID, e.target.value)
                              }
                              inputProps={{
                                min: 0,
                                style: { textAlign: "right", width: "100px" },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  padding: "4px 8px",
                                },
                              }}
                            /> */}
                          </TableCell>
                          <TableCell align="right">
                            <span className="font-semibold">
                              {formatter.format(calculateItemTotal(item))}
                            </span>
                          </TableCell>
                          <TableCell align="center">
                            <button
                              onClick={() => handleRemoveItem(item.Item_ID)}
                              className="w-10 h-10 bg-white cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center group">
                              <MdDeleteForever className="w-6 h-6 text-red-600 group-hover:text-red-400 transition-colors" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Grand Total */}
              {selectedItems.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-slate-900">
                      Grand Total:
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatter.format(grandTotal)} TZS
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitOrder}
                      disabled={submitting || selectedItems.length === 0}
                      sx={{
                        textTransform: "none",
                        paddingX: 3,
                        paddingY: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}>
                      {submitting ? "Submitting..." : "Submit Order"}
                    </Button>
                  </div>
                </div>
              )}
            </Paper>
          </div>
        </div>

        {/* Previous Requests Section */}
        <div className="mt-6">
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Previous Requests
              </h3>
            </div>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader aria-label="previous requests table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Request ID</StyledTableCell>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell>Items</StyledTableCell>
                    <StyledTableCell align="right">
                      Total Amount (TZS)
                    </StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingPreviousRequests && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ padding: 0 }}>
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {previousRequests.length === 0 &&
                    !loadingPreviousRequests && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No previous requests found
                        </TableCell>
                      </TableRow>
                    )}
                  {previousRequests.map((request) => (
                    <TableRow
                      key={request.Request_ID || request.id}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}>
                      <TableCell>
                        {request.Request_ID || request.id || "N/A"}
                      </TableCell>
                      <TableCell>
                        {request.Request_Date
                          ? new Date(request.Request_Date).toLocaleDateString()
                          : request.created_at
                          ? new Date(request.created_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {request.items && Array.isArray(request.items)
                          ? `${request.items.length} item(s)`
                          : request.Items
                          ? `${request.Items.length} item(s)`
                          : "N/A"}
                      </TableCell>
                      <TableCell align="right">
                        {request.Total_Amount
                          ? formatter.format(request.Total_Amount)
                          : request.total
                          ? formatter.format(request.total)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            request.Request_Status === "completed" ||
                            request.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : request.Request_Status === "pending" ||
                                request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          {request.Request_Status || request.status || "N/A"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
    </>
  );
};

export default PointOfSale;
