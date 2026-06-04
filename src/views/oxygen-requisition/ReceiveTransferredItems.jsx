import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { toast } from "react-hot-toast";
import { MdArrowBack } from "react-icons/md";
import apiClient from "../../api/Client";
import { Autocomplete, IconButton } from "@mui/material";
import {
  formatter,
  formatDateForDb,
  capitalize,
  reportError,
} from "../../../helpers";
import Breadcrumb from "../../components/Breadcrumb";
import DatePick from "../../components/DatePicker";
import { useNavigate } from "react-router-dom";

const ReceiveTransferredItems = () => {
  const [transfers, setTransfers] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [receivingItems, setReceivingItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [item, setItem] = useState("");
  const [remarks, setRemarks] = useState("");
  const [employee, setEmployee] = useState("");
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);

  const navigate = useNavigate();

  const handleReset = () => {
    setSelectedTransfer(null);
    setReceivingItems([]);
    setRemarks("");
  };

  const loadTransfers = async () => {
    setLoading(true);
    try {
      let url = `/oxygen/shifted-oxygen-item?`;

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

      const response = await apiClient.get(url, { Cache_Status: "pending" });

      if (!response.ok) {
        setLoading(false);
        reportError(response, "Failed to fetch pending transfers");
        return;
      }

      const itemData = response?.data?.data?.data;
      const newData = itemData?.map((transfer, index) => ({
        ...transfer,
        key: index + 1,
        label: `Transfer - ${transfer?.Transaction_Date} - ${transfer?.employee?.name}`,
      }));
      setTransfers(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch transfers error:", error);
      setLoading(false);
      toast.error("Failed to load pending transfers");
    }
  };

  const loadRejectionReasons = async () => {
    try {
      const response = await apiClient.get(
        "/settings/reason?&Project_Type=oxygen",
      );
      if (response.ok && response?.data?.data?.data) {
        const reasons = response?.data?.data?.data?.map((reason) => ({
          Reason_ID: reason?.Reason_ID,
          label: reason?.Reason_Description,
        }));
        setRejectionReasons(reasons);
      }
    } catch (error) {
      console.error("Failed to load rejection reasons:", error);
    }
  };

  const handleTransferChange = (value) => {
    setSelectedTransfer(value);
    if (value && value.ShiftedItem) {
      // Initialize receiving items with all items from the transfer
      const initialItems = value.ShiftedItem.map((item) => ({
        ...item,
        receivingQuantity: "",
        maxQuantity: Number(item.Shifted_Balance),
        rejectionReason: null,
        isPartialRejection: false,
      }));
      setReceivingItems(initialItems);
    } else {
      setReceivingItems([]);
    }
  };

  const handleQuantityChange = (index, value) => {
    const newItems = [...receivingItems];
    const rawValue = value.replace(/[^\d.]/g, "");

    const maxBalance = newItems[index].maxQuantity;
    const enteredQuantity = Number(rawValue);

    // Validate quantity doesn't exceed shifted balance
    if (enteredQuantity > maxBalance) {
      toast.error(
        `Quantity cannot exceed shifted balance of ${formatter.format(
          maxBalance,
        )}`,
      );
      newItems[index].receivingQuantity = maxBalance.toString();
      newItems[index].isPartialRejection = false;
    } else {
      newItems[index].receivingQuantity = rawValue;
      // Check if received quantity is less than transferred quantity AND greater than 0
      newItems[index].isPartialRejection =
        enteredQuantity < maxBalance && enteredQuantity > 0;

      // Clear rejection reason if receiving full quantity or zero
      if (enteredQuantity === maxBalance || enteredQuantity === 0) {
        newItems[index].rejectionReason = null;
      }
    }

    setReceivingItems(newItems);
  };

  const handleRejectionReasonChange = (index, reason) => {
    const newItems = [...receivingItems];
    newItems[index].rejectionReason = reason;
    setReceivingItems(newItems);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!selectedTransfer) {
      toast.error("Please select a transfer");
      return;
    }

    // Get employee info from localStorage
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }

    // Validate that at least one item has quantity > 0
    const itemsToReceive = receivingItems.filter(
      (item) => item.receivingQuantity && Number(item.receivingQuantity) > 0,
    );

    if (itemsToReceive.length === 0) {
      toast.error("Please enter quantities for at least one item");
      return;
    }

    // Validate quantities don't exceed shifted balances
    for (let i = 0; i < itemsToReceive.length; i++) {
      const item = itemsToReceive[i];
      const maxBalance = item.maxQuantity;
      const quantity = Number(item.receivingQuantity);

      if (quantity > maxBalance) {
        toast.error(
          `${item?.item?.Item_Name}: Quantity (${formatter.format(
            quantity,
          )}) exceeds shifted balance (${formatter.format(maxBalance)})`,
        );
        return;
      }
    }

    // Validate that partial rejections have rejection reasons
    const partialRejectionsWithoutReason = receivingItems.filter((item) => {
      const receivingQty = Number(item.receivingQuantity || 0);
      const shiftedQty = item.maxQuantity;
      const isPartial = receivingQty > 0 && receivingQty < shiftedQty;

      // console.log(item);

      // Check if it's a partial rejection and missing rejection reason
      return isPartial && !item?.rejectionReason;
    });

    if (partialRejectionsWithoutReason.length > 0) {
      toast.error(
        "Please select rejection reasons for items with partial quantities",
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        Employee_ID: employeeId,
        Cache_ID: selectedTransfer?.Cache_ID,
        items: receivingItems.map((item) => {
          console.log(item);
          const receivingQty = Number(item.receivingQuantity || 0);
          const shiftedQty = item.maxQuantity;
          const balanceQty = shiftedQty - receivingQty;
          const isPartialRejection =
            receivingQty > 0 && receivingQty < shiftedQty;

          return {
            Item_ID: item?.Item_ID,
            Quantity: receivingQty,
            Shifted_Quantity: shiftedQty,
            Rejected_Quantity: isPartialRejection ? balanceQty : 0,
            Rejected_Reason_ID:
              isPartialRejection && item?.rejectionReason
                ? item?.rejectionReason?.Reason_ID
                : null,
          };
        }),
        Sales_Remarks: remarks,
      };

      const response = await apiClient.put(
        "/oxygen/approve-oxygen-to-sales",
        payload,
      );

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

          console.log(response);
          if (typeof serverMessage === "string") {
            errorText = serverMessage;
          } else if (
            typeof serverMessage === "object" &&
            serverMessage !== null
          ) {
            errorText = Object.values(serverMessage).flat()[0];
          } else {
            errorText = "Failed to receive items";
          }

          toast.error(errorText);
        }
        return;
      }
      // Success
      setLoading(false);
      toast.success("Items received successfully");

      // Reset form
      handleReset();
      loadTransfers();
    } catch (error) {
      console.error("Receive items error:", error);
      setLoading(false);
      toast.error("An unexpected error occurred. Please try again");
    }
  };

  useEffect(() => {
    loadTransfers();
    loadRejectionReasons();
  }, [startDate, endDate, item, employee]);

  const itemOnChange = (e, value) => {
    setItem(value);
  };

  const employeeOnChange = (e, value) => {
    setEmployee(value);
  };

  return (
    <>
      <Breadcrumb />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <IconButton
              onClick={() => navigate(-1)}
              className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <MdArrowBack />
            </IconButton>
            <div>
              <h1 className="font-bold text-xl text-gray-800">
                Receive Transferred Items
              </h1>
              <p className="text-gray-500 text-xs mt-1">
                Receive the transferred items from productions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-center text-2xl font-semibold py-4 text-gray-800">
            {selectedTransfer
              ? "Receive Transferred Items From Production"
              : "Select a Transfer"}
          </h3>

          {/* Transfer Selection */}
          <div className="mb-6">
            <Autocomplete
              id="transfer-select"
              options={transfers}
              size="small"
              className="w-full"
              value={selectedTransfer}
              onChange={(e, value) => handleTransferChange(value)}
              getOptionLabel={(option) => option.label || ""}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField {...params} label="Select Transfer" />
              )}
              disabled={loading}
              noOptionsText="No pending transfers available"
            />
          </div>

          {/* Transfer Details and Items */}
          {selectedTransfer && (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Transfer Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {selectedTransfer.Transaction_Date}
                  </div>
                  <div>
                    <span className="font-medium">Employee:</span>{" "}
                    {capitalize(selectedTransfer?.employee?.name)}
                  </div>
                  <div>
                    <span className="font-medium">Total Items:</span>{" "}
                    {selectedTransfer.ShiftedItem?.length || 0}
                  </div>
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto px-2">
                {receivingItems.map((item, index) => {
                  const receivingQty = Number(item.receivingQuantity || 0);
                  const shiftedQty = item.maxQuantity;
                  const isPartial =
                    receivingQty > 0 && receivingQty < shiftedQty;
                  const showRejectionReason = isPartial;

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 mt-2 mb-4 pb-4 border-b border-gray-200 last:border-b-0 ${
                        showRejectionReason ? "bg-yellow-50 p-3 rounded-lg" : ""
                      }`}
                    >
                      <div className="flex-1 space-y-3">
                        <TextField
                          size="small"
                          label="Item Name"
                          variant="outlined"
                          className="w-full mb-1"
                          value={item?.item?.Item_Name || ""}
                          disabled
                        />
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <TextField
                            size="small"
                            label="Shifted Quantity"
                            variant="outlined"
                            className="w-full"
                            value={formatter.format(item.maxQuantity)}
                            disabled
                          />
                          <TextField
                            size="small"
                            label={`Receiving Quantity (Max: ${formatter.format(
                              item.maxQuantity,
                            )})`}
                            variant="outlined"
                            className="w-full"
                            value={
                              item.receivingQuantity
                                ? formatter.format(
                                    Number(item.receivingQuantity),
                                  )
                                : ""
                            }
                            onChange={(e) =>
                              handleQuantityChange(index, e.target.value)
                            }
                            disabled={loading}
                            error={showRejectionReason && !item.rejectionReason}
                            helperText={
                              showRejectionReason && !item.rejectionReason
                                ? "Partial quantity - please select a rejection reason"
                                : ""
                            }
                          />
                        </div>

                        {/* Rejection Reason Autocomplete - shows only when received quantity is less than transferred quantity */}
                        {showRejectionReason && (
                          <div className="mt-3">
                            <Autocomplete
                              id={`rejection-reason-${index}`}
                              options={rejectionReasons}
                              size="small"
                              className="w-full"
                              value={item.rejectionReason || null}
                              onChange={(e, value) =>
                                handleRejectionReasonChange(index, value)
                              }
                              getOptionLabel={(option) => option.label || ""}
                              isOptionEqualToValue={(option, value) =>
                                option.Reason_ID === value?.Reason_ID
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Rejection Reason"
                                  required
                                  error={!item.rejectionReason}
                                  helperText={
                                    !item.rejectionReason
                                      ? "Rejection reason is required for partial quantity"
                                      : ""
                                  }
                                />
                              )}
                              disabled={loading}
                              noOptionsText="No rejection reasons available"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-2">
                <TextField
                  size="small"
                  label="Remarks"
                  id="outlined-multiline-static"
                  multiline
                  rows={2}
                  variant="outlined"
                  className="w-full mb-1"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {selectedTransfer && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex w-full h-11 justify-center items-center cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-gray-700 font-medium border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel & Select Another Transfer
              </button>
            )}

            <button
              onClick={(e) => submit(e)}
              disabled={loading || !selectedTransfer}
              className="flex w-full h-11 justify-center items-center cursor-pointer rounded-lg bg-oceanic px-4 py-2 text-white font-medium shadow-md hover:bg-blue-zodiac-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Receiving..." : "Receive Items"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiveTransferredItems;
