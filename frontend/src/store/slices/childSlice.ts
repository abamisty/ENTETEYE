import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChildUser } from "../../types/auth";

interface ChildState {
  dashboardData: any; // Replace with child-specific dashboard type
  loading: boolean;
  error: string | null;
  currentActivity: any; // Track current activity/game
}

const initialState: ChildState = {
  dashboardData: null,
  loading: false,
  error: null,
  currentActivity: null,
};

const childSlice = createSlice({
  name: "child",
  initialState,
  reducers: {
    fetchChildDashboardStart: (state) => {
      state.loading = true;
    },
    fetchChildDashboardSuccess: (state, action: PayloadAction<any>) => {
      state.dashboardData = action.payload;
      state.loading = false;
    },
    fetchChildDashboardFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentActivity: (state, action: PayloadAction<any>) => {
      state.currentActivity = action.payload;
    },
    updateChildPoints: (state, action: PayloadAction<number>) => {
      if (state.dashboardData) {
        state.dashboardData.totalPoints += action.payload;
      }
    },
  },
});

export const {
  fetchChildDashboardStart,
  fetchChildDashboardSuccess,
  fetchChildDashboardFailure,
  setCurrentActivity,
  updateChildPoints,
} = childSlice.actions;
export default childSlice.reducer;
