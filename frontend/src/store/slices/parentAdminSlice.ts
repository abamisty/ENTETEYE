import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ParentAdminUser } from "../../types/auth";

interface ParentAdminState {
  dashboardData: any;
  loading: boolean;
  error: string | null;
}

const initialState: ParentAdminState = {
  dashboardData: null,
  loading: false,
  error: null,
};

const parentAdminSlice = createSlice({
  name: "parentAdmin",
  initialState,
  reducers: {
    fetchDashboardStart: (state) => {
      state.loading = true;
    },
    fetchDashboardSuccess: (state, action: PayloadAction<any>) => {
      state.dashboardData = action.payload;
      state.loading = false;
    },
    fetchDashboardFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
} = parentAdminSlice.actions;
export default parentAdminSlice.reducer;
