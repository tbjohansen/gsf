import moment from "moment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const DatePick = ({ label, value, onChange, className }) => {
  return (
    <LocalizationProvider
      dateAdapter={AdapterMoment}
      dateLibInstance={moment.utc}
    >
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        className={`${className}`}
        slotProps={{
          textField: {
            size: "small",
          },
          actionBar: {
            actions: ["clear", "today", "accept"],
          },
        }}
        clearable
        onClear={() => onChange(null)}
      />
    </LocalizationProvider>
  );
};

export default DatePick;
