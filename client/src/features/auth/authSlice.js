import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api";

export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token found");

    // Try several endpoints that might return logged-in user
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
      } catch (err) {
        // try next endpoint
        continue;
      }
    }

    // All attempts failed -> clear token and role
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return rejectWithValue("Token invalid or endpoints missing");
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    role: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      const payloadUser = action.payload?.user || {};
      const user = {
        ...payloadUser,
        id: payloadUser.id || payloadUser._id,
      };

      state.user = user;
      state.isAuthenticated = true;
      state.role = user?.role || null;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user"); // keep your original removal
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        const user = action.payload;
        state.user = user;
        state.isAuthenticated = true;
        state.role = user?.role || null;
        state.loading = false;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Verification failed";
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
