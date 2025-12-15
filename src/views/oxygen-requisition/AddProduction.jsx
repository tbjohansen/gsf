import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdAdd, MdDelete } from "react-icons/md";
import apiClient from "../../api/Client";
import { Autocomplete, IconButton } from "@mui/material";
import { formatter } from "../../../helpers";
import Breadcrumb from "../../components/Breadcrumb";

const AddProduction = ({ loadData }) => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([
    { item: null, quantity: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleReset = () => {
    setSelectedItems([{ item: null, quantity: "" }]);
  };

  const loadItems = async () => {
    try {
      const response = await apiClient.get(`/settings/item?Item_Type=oxygen`);

      if (!response.ok) {
        toast.error(response.data?.error || "Failed to fetch items");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        toast.error(response.data.error || "Failed to fetch items");
        return;
      }

      const itemData = response?.data?.data;
      const newData = itemData?.map((item, index) => ({
        id: item?.Item_ID,
        label: item?.Item_Name,
        key: index + 1,
        ...item,
      }));
      setItems(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Fetch items error:", error);
    }
  };

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { item: null, quantity: "" }]);
  };

  const handleRemoveItem = (index) => {
    if (selectedItems.length === 1) {
      toast.error("At least one produced item is required");
      return;
    }
    const newItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newItems);
  };

  const handleItemChange = (index, value) => {
    const newItems = [...selectedItems];
    newItems[index].item = value;
    setSelectedItems(newItems);
  };

  // Get array of already selected item IDs
  const getSelectedItemIds = (currentIndex) => {
    return selectedItems
      .map((item, idx) => (idx !== currentIndex && item.item ? item.item.id : null))
      .filter((id) => id !== null);
  };

  // Filter out already selected items for a specific row
  const getAvailableItems = (currentIndex) => {
    const selectedIds = getSelectedItemIds(currentIndex);
    return items.filter((item) => !selectedIds.includes(item.id));
  };

  const handleQuantityChange = (index, value) => {
    const newItems = [...selectedItems];
    const rawValue = value.replace(/[^\d.]/g, "");
    newItems[index].quantity = rawValue;
    setSelectedItems(newItems);
  };

  const submit = async (e) => {
    e.preventDefault();

    // Validate all items
    const invalidItems = selectedItems.filter(
      (item) => !item.item || !item.quantity || item.quantity < 1
    );

    if (invalidItems.length > 0) {
      toast.error(
        "Please select items and enter valid quantities for all rows"
      );
      return;
    }

    // Check for duplicate items
    const itemIds = selectedItems.map((item) => item.item.id);
    const duplicates = itemIds.filter(
      (id, index) => itemIds.indexOf(id) !== index
    );

    if (duplicates.length > 0) {
      toast.error("Duplicate items are not allowed");
      return;
    }

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Prepare the items array in the format [{Item_ID: 1, Quantity: 20}, ...]
      const itemsData = selectedItems.map((item) => ({
        Item_ID: item.item.id,
        Quantity: Number(item.quantity),
      }));

      // Prepare the data to send
      const data = {
        items: itemsData,
        Employee_ID: employeeId,
      };

      // Make API request
      const response = await apiClient.post("/oxygen/oxygen-stock-count", data);

      if (!response.ok) {
        setLoading(false);

        if (response.problem === "NETWORK_ERROR") {
          toast.error("Network error. Please check your connection");
        } else if (response.problem === "TIMEOUT_ERROR") {
          toast.error("Request timeout. Please try again");
        } else {
          console.log("Error:", response.data?.error);
          toast.error(
            response?.data?.error || "Failed to create production details"
          );
        }
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);

        if (response.data?.error && typeof response.data.error === "object") {
          console.log(response.data.error);
          toast.error("Failed to create production details");
        } else {
          const errorMessage =
            response?.data?.error || "Failed to create production details";
          toast.error(errorMessage);
        }
        return;
      }

      // Success
      setLoading(false);
      toast.success("Production details are created successfully");

      // Reset form
      handleReset();

      // Trigger parent component refresh
      if (loadData && typeof loadData === "function") {
        loadData();
      }
    } catch (error) {
      console.error("Create item error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <>
    <Breadcrumb/>
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-center text-2xl font-semibold py-4 text-gray-800">
          Add Produced Items
        </h3>
        <div className="max-h-[70vh] overflow-y-auto px-2">
          {selectedItems.map((selectedItem, index) => (
            <div
              key={index}
              className="flex items-center gap-3 mt-2 mb-4 pb-4 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex-1 space-y-3">
                <Autocomplete
                  id={`item-${index}`}
                  options={getAvailableItems(index)}
                  size="small"
                  className="w-full"
                  value={selectedItem.item}
                  onChange={(e, value) => handleItemChange(index, value)}
                  getOptionLabel={(option) => option.label || ""}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value?.id
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select Item" />
                  )}
                  disabled={loading}
                  noOptionsText="No items available"
                />
                <TextField
                  size="small"
                  id={`quantity-${index}`}
                  label="Item Quantity"
                  variant="outlined"
                  className="w-full"
                  value={
                    selectedItem.quantity
                      ? formatter.format(Number(selectedItem.quantity))
                      : ""
                  }
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  disabled={loading}
                />
              </div>
              <IconButton
                onClick={() => handleRemoveItem(index)}
                disabled={loading || selectedItems.length === 1}
                color="error"
                className="self-start mt-1"
              >
                <MdDelete size={24} />
              </IconButton>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleAddItem}
            disabled={loading}
            className="flex w-full h-11 justify-center items-center cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-gray-700 font-medium border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdAdd className="mr-2" size={20} /> Add Another Item
          </button>

          <button
            onClick={(e) => submit(e)}
            disabled={loading}
            className="flex w-full h-11 justify-center items-center cursor-pointer rounded-lg bg-oceanic px-4 py-2 text-white font-medium shadow-md hover:bg-blue-zodiac-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Save Production"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default AddProduction;