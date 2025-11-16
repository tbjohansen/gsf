import { configureStore } from "@reduxjs/toolkit";
import { HostelSlice } from "../features/HostelSlice";

export const store = configureStore({
  reducer: { hostels: HostelSlice, },
});
