import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api";

// ✅ Restore auth from localStorage
const storedUser = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const storedToken = localStorage.getItem("token") || null;
const storedRole = localStorage.getItem("role") || storedUser?.role || null;

// ✅ Async thunk: verify user
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

    // ❌ No valid endpoint worked → token might be expired
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

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user?.role || "");
      if (token) localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
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
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user?.role || "");
      })
      .addCase(verifyUser.rejected, (state, action) => {
        // ⚠️ Do NOT remove token immediately — only mark unauthenticated
        state.loading = false;
        state.error = action.payload || "Verification failed";
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
