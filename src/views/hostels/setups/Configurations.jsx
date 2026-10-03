import { useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
} from "@mui/material";

export default function Configurations({
  initialBookingMode = false,
  onSubmit,
}) {
  const [bookingMode, setBookingMode] = useState(initialBookingMode);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { bookingMode };
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        console.log("Configurations submitted:", payload);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <form onSubmit={handleSubmit}>
        {/* <Typography className="font-semibold px-2 pt-2 py-2">
          Hostel Management Configurations
        </Typography> */}

        <div className="py-4 flex justify-center">
          <div className="w-[80%] flex flex-row gap-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={bookingMode}
                  onChange={(e) => setBookingMode(e.target.checked)}
                  name="bookingMode"
                  color="primary"
                />
              }
              label="Booking mode"
            />
          </div>
        </div>

        <div className="flex justify-center py-4">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            className="normal-case w-[80%]"
          >
            {submitting ? "Saving..." : "Submit"}
          </Button>
        </div>
      </form>
    </Paper>
  );
}
