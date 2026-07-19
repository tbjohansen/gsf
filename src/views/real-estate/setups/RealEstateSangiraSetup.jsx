import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  IconButton,
  TextField,
  Chip,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import {
  MdEdit,
  MdCheck,
  MdClose,
  MdHistory,
  MdPersonOff,
  MdRefresh,
} from "react-icons/md";
import { FaGraduationCap, FaTractor, FaWind, FaBuilding } from "react-icons/fa";
import apiClient from "../../../api/Client";
import toast from "react-hot-toast";
import { capitalize } from "../../../../helpers";

// Adjust to your actual settings endpoint
const CONFIG_ENDPOINT = "/settings/system-configuration";
// Get employee info from localStorage
const employeeId = localStorage.getItem("employeeId");

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Non-editable stat tile
function StatTile({ icon, label, value }) {
  return (
    <div
      className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200
                 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
        <p className="text-sm font-medium leading-tight text-slate-500">
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold text-slate-900">{value}</span>
        <span className="text-sm text-slate-400">days</span>
      </div>
    </div>
  );
}

// Stat tile with an edit button that opens a modal (used for Real_Estate_expire_After_Days)
function EditableStatTile({ icon, label, value, onEditClick, disabled }) {
  return (
    <div
      className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200
                 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            {icon}
          </div>
          <p className="text-sm font-medium leading-tight text-slate-500">
            {label}
          </p>
        </div>

        <Tooltip title="Edit value">
          <span>
            <IconButton
              size="large"
              onClick={onEditClick}
              disabled={disabled}
              aria-label={`Edit ${label}`}
            >
              <MdEdit size={20} />
            </IconButton>
          </span>
        </Tooltip>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold text-slate-900">{value}</span>
        <span className="text-sm text-slate-400">days</span>
      </div>
    </div>
  );
}

// Skeleton placeholder shown while the config is loading
function StatTileSkeleton() {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Skeleton variant="rounded" width={36} height={36} />
        <Skeleton variant="text" width={90} height={20} />
      </div>
      <Skeleton variant="text" width={60} height={40} />
    </div>
  );
}

// Modal for editing Real_Estate_expire_After_Days
function EditRealEstateModal({ open, value, saving, onClose, onSave }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");

  // Keep the draft in sync whenever the modal is (re)opened with a fresh value
  React.useEffect(() => {
    if (open) {
      setDraft(value);
      setError("");
    }
  }, [open, value]);

  const handleSave = () => {
    const num = Number(draft);
    if (!Number.isInteger(num) || num < 1) {
      setError("Enter a whole number, 1 or greater");
      return;
    }
    onSave(num);
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle className="!flex !items-center !gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <FaBuilding size={15} />
        </span>
        Edit Real Estate Sangira expiry
      </DialogTitle>
      <DialogContent>
        <p className="mb-4 text-sm text-slate-500">
          Number of days before a Real Estate Sangira expires automatically.
        </p>
        <TextField
          type="number"
          label="Expire after (days)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          error={!!error}
          helperText={error || " "}
          autoFocus
          fullWidth
          disabled={saving}
          inputProps={{ min: 1 }}
        />
      </DialogContent>
      <DialogActions className="!px-6 !pb-5">
        <Button
          onClick={onClose}
          disabled={saving}
          startIcon={<MdClose size={16} />}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          startIcon={
            saving ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <MdCheck size={16} />
            )
          }
          variant="contained"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function RealEstateSangiraSetup() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(CONFIG_ENDPOINT);

      if (!response.ok) {
        setLoading(false);
        toast.error("Failed to fetch features");
        return;
      }

      // Adjust based on your API response structure
      const configData = response?.data?.data;
      // console.log(configData);
      setConfig(configData ?? null);
      setLoading(false);
    } catch (error) {
      console.error("Fetch features error:", error);
      setLoading(false);
      toast.error("Failed to load features");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRealEstateSave = async (newValue) => {
    if (!config) return;

    if (!employeeId) {
      toast.error("User information not found. Please login again.");
      return;
    }
    const previous = config.Real_Estate_expire_After_Days;
    setSaving(true);

    // Optimistic update
    setConfig((prev) => ({ ...prev, Real_Estate_expire_After_Days: newValue }));

    try {
      // Adjust method/payload to match your API contract
      const response = await apiClient.post(`${CONFIG_ENDPOINT}`, {
        Real_Estate_expire_After_Days: newValue,
        Config_ID: config.Config_ID,
        Employee_ID: employeeId,
      });

      if (!response.ok) {
        setConfig((prev) => ({
          ...prev,
          Real_Estate_expire_After_Days: previous,
        }));
        toast.error("Failed to update Real Estate expiry");
        setSaving(false);
        return;
      }

      // Adjust based on your API response structure
      const updated = response?.data?.data;
      setConfig((prev) => ({
        ...prev,
        ...updated,
        Real_Estate_expire_After_Days:
          updated?.Real_Estate_expire_After_Days ?? newValue,
      }));
      toast.success(`Real Estate expiry updated to ${newValue} days`);
      setModalOpen(false);
    } catch (error) {
      console.error("Update Real Estate expiry error:", error);
      setConfig((prev) => ({
        ...prev,
        Real_Estate_expire_After_Days: previous,
      }));
      toast.error("Failed to update Real Estate expiry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full items-start justify-center bg-slate-50 p-4 sm:p-8">
      <Card
        elevation={0}
        className="w-full max-w-3xl !rounded-3xl border border-slate-200"
        sx={{ borderRadius: 6 }}
      >
        <CardContent className="!p-5 sm:!p-8">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Sangira Number
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Expiration Time Settings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Number of days before sangira number expires automatically
              </p>
            </div>

            {/* <Tooltip title="Refresh">
              <span>
                <IconButton size="small" onClick={loadData} disabled={loading}>
                  <MdRefresh
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                </IconButton>
              </span>
            </Tooltip> */}
          </div>

          <Divider className="!my-5" />

          {/* Stat grid */}
          <div className="grid grid-cols-1 gap-3">
            {loading && !config ? (
              <StatTileSkeleton />
            ) : !config ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-sm text-slate-500">
                  Couldn't load expiration settings.
                </p>
                <Button size="small" onClick={loadData} className="!mt-2">
                  Try again
                </Button>
              </div>
            ) : (
              <EditableStatTile
                icon={<FaBuilding size={16} />}
                label="Real Estate"
                value={config.Real_Estate_expire_After_Days}
                disabled={saving}
                onEditClick={() => setModalOpen(true)}
              />
            )}
          </div>

          {config && (
            <>
              <Divider className="!my-5" />

              {/* Footer meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MdPersonOff size={16} className="!text-slate-400" />
                  <span>
                    Updated By:{" "}
                    <span className="font-medium text-slate-600">
                      {config?.employee ? capitalize(config?.employee?.name) : "N/A"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MdHistory size={16} className="!text-slate-400" />
                  <span>Last updated {formatDate(config.updated_at)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {config && (
        <EditRealEstateModal
          open={modalOpen}
          value={config.Real_Estate_expire_After_Days}
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSave={handleRealEstateSave}
        />
      )}
    </div>
  );
}
