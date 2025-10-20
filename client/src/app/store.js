import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import dashboardReducer from "../features/auth/dashboardSlice";
import employeeReducer from "../features/auth/employeeSlice";
import settingsReducer from "../features/auth/settingsSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    employee: employeeReducer,
    settings: settingsReducer,
  },
});
