import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api";

// Read stored auth info from localStorage
const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const storedRole = localStorage.getItem("role") || null;

// Async thunk to verify user using multiple endpoints
export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token found");

    const endpoints = ["/profile", "/admin/profile", "/admin/me", "/auth/me"];
    for (const ep of endpoints) {
      try {
        const response = await API.get(ep);
        if (response?.data) {
          const data = response.data;
          return {
            ...data,
            role: localStorage.getItem("role") || data.role,
          };
        }
      } catch {
        continue; // try next endpoint
      }
    }

    // No valid endpoint worked → clear stored data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    return rejectWithValue("Token invalid or endpoints missing");
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    isAuthenticated: !!storedToken,
    role: storedRole,
    loading: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      const payloadUser = action.payload?.user || {};
      const token = action.payload?.token;
      const user = {
        ...payloadUser,
        id: payloadUser.id || payloadUser._id,
      };

      state.user = user;
      state.isAuthenticated = true;
      state.role = user?.role || null;
      state.loading = false;
      state.error = null;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user?.role || "");
      if (token) localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        const user = action.payload;
        state.user = user;
        state.isAuthenticated = true;
        state.role = user?.role || null;
        state.loading = false;
        state.error = null;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user?.role || "");
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.error = action.payload || "Verification failed";
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
