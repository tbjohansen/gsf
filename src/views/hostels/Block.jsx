import React, { useEffect, useRef, useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Card,
  Alert,
  CircularProgress,
} from "@mui/material";
import Floors from "./Floors";
import Wings from "./Wings";
import Breadcrumb from "../../components/Breadcrumb";
import apiClient from "../../api/Client";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const Block = () => {
  const hasFetchedData = useRef(false);

  const { blockID } = useSearchParams();

  const [activeTab, setActiveTab] = useState(0);
  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blockTabError, setBlockTabError] = useState(false);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    //If trying to access Blocks tab (index 1) and no wings exist, prevent access
    if (newValue === 1 && wings?.length === 0) {
      setBlockTabError(true);
      // Auto-revert after 2 seconds
      setTimeout(() => setBlockTabError(false), 2000);
      return;
    }
    // setBlockTabError(false);
    setActiveTab(newValue);
  };

  useEffect(() => {
    loadData();
  }, [blockID]);

  const loadData = async () => {
    console.log("Data");
    setLoading(true);
    try {
      const response = await apiClient.get(`/settings/wing`, {
        Block_ID: blockID,
      });

      if (!response.ok) {
        setLoading(false);
        toast.error("Failed to fetch wings");
        return;
      }

      if (response.data?.error || response.data?.code >= 400) {
        setLoading(false);
        toast.error("Failed to fetch wings");
        return;
      }

      // Adjust based on your API response structure
      const blockData = response?.data?.data;
      const newData = blockData?.map((block, index) => ({
        ...block,
        key: index + 1,
      }));
      // console.log(newData);
      setWings(Array.isArray(newData) ? newData : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch blocks error:", error);
      setLoading(false);
      toast.error("Failed to load wings");
    }
  };

  // console.log(wings);

  return (
    <>
      <Breadcrumb />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="mx-auto">
          <Card className="shadow-xl rounded-2xl overflow-hidden">
            <Box
              sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab label="Wings" className="text-lg font-semibold" />
                <Tab label="Floors" className="text-lg font-semibold" />
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

            {/* Error Alert for Blocks Tab */}
            <>
              {blockTabError && (
                <Alert severity="error" className="m-4">
                  You cannot access Floors tab without saving at least one Wing
                  first!
                </Alert>
              )}
            </>

            <div className={`p-6 ${activeTab === 0 ? "wing" : "hidden"}`}>
              <Wings />
            </div>

            {/* <div className={`p-6 ${activeTab === 0 ? "wing" : "hidden"}`}>
               <Floors />
            </div> */}

            <div className={`p-6 ${activeTab === 1 ? "block" : "hidden"}`}>
              {loading ? (
                <div className="text-center py-12">
                  <CircularProgress />
                  <p className="mt-4 text-gray-600">Loading wings data...</p>
                </div>
              ) : wings?.length > 0 ? (
                <>
                  <Floors />
                </>
              ) : (
                <div className="text-center py-12">
                  <Alert severity="info" className="mb-4">
                    You need to create at least one Wing before you can add
                    Floors.
                  </Alert>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Block;
