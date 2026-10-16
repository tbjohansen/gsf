import React, { useEffect, useState, useCallback } from "react";
import {
  Tabs,
  Tab,
  Box,
  Card,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import Floors from "./Floors";
import Wings from "./Wings";
import Breadcrumb from "../../components/Breadcrumb";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";

const Block = () => {
  const { blockID } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blockTabError, setBlockTabError] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Load wings — shared with the Wings child to avoid duplicate fetches
  // ─────────────────────────────────────────────────────────────
  const loadData = useCallback(
    async (signal) => {
      if (!blockID) return;

      setLoading(true);
      try {
        const response = await apiClient.get(
          `/settings/wing`,
          { Block_ID: blockID },
          { signal },
        );

        if (response.problem === "CANCEL_ERROR") return;

        if (!response.ok) {
          setLoading(false);

          if (response.problem === "NETWORK_ERROR") {
            toast.error("Network error. Please check your connection");
          } else if (response.problem === "TIMEOUT_ERROR") {
            toast.error("Request timeout. Please try again");
          } else {
            const serverMessage =
              response?.data?.error || response?.data?.message;
            toast.error(
              typeof serverMessage === "string"
                ? serverMessage
                : "Failed to fetch wings",
            );
          }
          return;
        }

        if (response.data?.error || response.data?.code >= 400) {
          setLoading(false);
          const serverMessage =
            typeof response.data?.error === "string"
              ? response.data.error
              : response.data?.message || "Failed to fetch wings";
          toast.error(serverMessage);
          return;
        }

        const blockData = response?.data?.data;
        const newData = blockData?.map((b, index) => ({
          ...b,
          key: index + 1,
        }));
        setWings(Array.isArray(newData) ? newData : []);
        setLoading(false);
      } catch (error) {
        if (
          error.isAborted ||
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }
        if (error.is429) {
          setLoading(false);
          toast.error(
            error.userMessage || "Too many requests. Please slow down.",
          );
          return;
        }
        console.error("Fetch wings error:", error);
        setLoading(false);
        toast.error("Failed to load wings");
      }
    },
    [blockID],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  // ─────────────────────────────────────────────────────────────
  // Tab change — Floors tab is disabled in the UI, but keep the
  // guard here too in case it's ever re-enabled
  // ─────────────────────────────────────────────────────────────
  const handleTabChange = (event, newValue) => {
    if (newValue === 1 && wings.length === 0) {
      setBlockTabError(true);
      return;
    }
    setBlockTabError(false);
    setActiveTab(newValue);
  };

  // Auto-dismiss the error alert after 3s
  useEffect(() => {
    if (!blockTabError) return;
    const t = setTimeout(() => setBlockTabError(false), 3000);
    return () => clearTimeout(t);
  }, [blockTabError]);

  const floorsTabDisabled = loading || wings.length === 0;

  return (
    <>
      <Breadcrumb />
      <div className="flex flex-row gap-4 mb-1">
        <IconButton
          onClick={() => navigate(-1)}
          className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
        >
          <MdArrowBack />
        </IconButton>
        <h4 className="my-2">Hostel Wings & Floors List</h4>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="mx-auto">
          <Card className="shadow-xl rounded-2xl overflow-hidden">
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "white",
                "& .MuiTabs-indicator": {
                  backgroundColor: "#1976d2",
                  height: 3,
                },
                "& .Mui-selected": {
                  color: "#1976d2 !important",
                },
                "& .MuiTab-root": {
                  color: "#666",
                  "&:hover": {
                    color: "#1976d2",
                  },
                },
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab
                  label="Wings"
                  className="text-lg font-semibold"
                  sx={{
                    "&.Mui-selected": {
                      color: "#1976d2",
                      fontWeight: "bold",
                    },
                  }}
                />
                <Tab
                  label="Floors"
                  disabled={floorsTabDisabled}
                  className="text-lg font-semibold"
                  sx={{
                    "&.Mui-selected": {
                      color: "#1976d2",
                      fontWeight: "bold",
                    },
                  }}
                />
              </Tabs>
            </Box>

            {/* Loading Alert */}
            {loading && (
              <Alert
                severity="info"
                className="m-4"
                icon={<CircularProgress size={20} />}
              >
                Loading wings data, please wait...
              </Alert>
            )}

            {/* Error Alert for Floors Tab */}
            {blockTabError && (
              <Alert severity="error" className="m-4">
                You cannot access Floors tab without saving at least one Wing
                first!
              </Alert>
            )}

            {/* Wings tab — pass wings + refresh handler down to avoid a
                second fetch inside Wings.jsx */}
            {activeTab === 0 && (
              <div className="p-6">
                <Wings
                  wings={wings}
                  wingsLoading={loading}
                  onRefresh={loadData}
                />
              </div>
            )}

            {/* Floors tab */}
            {activeTab === 1 && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <CircularProgress />
                    <p className="mt-4 text-gray-600">Loading wings data...</p>
                  </div>
                ) : wings?.length > 0 ? (
                  <Floors />
                ) : (
                  <div className="text-center py-12">
                    <Alert severity="info" className="mb-4">
                      You need to create at least one Wing before you can add
                      Floors.
                    </Alert>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default Block;