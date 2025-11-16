import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hostels: [],
};

export const HostelSlice = createSlice({
  name: "hostels",
  initialState,
  reducers: {
    addHostels: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { addHostels } = HostelSlice.actions;

export default HostelSlice.reducer;
