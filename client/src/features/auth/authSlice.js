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
    if (!token) {
      return rejectWithValue("No token found");
    }

    // Try multiple endpoints to detect user type
    const endpoints = ["/profile", "/admin/profile", "/admin/me", "/auth/me"];
    for (const ep of endpoints) {
      try {
        const response = await API.get(ep);
        if (response.data && response.data.role) {
          return {
            ...response.data,
            role: localStorage.getItem("role") || response.data.role,
          };
        }
      } catch {
        continue;
      }
    }

    // All attempts failed → clear stored data
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
      state.isAuthenticated = !!user;
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
      localStorage.removeItem("name");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        const user = action.payload || null;
        state.isAuthenticated = !!user;
        state.user = user;
        state.role = user?.role || null;
        state.loading = false;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user?.role || "");
      })
      .addCase(verifyUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.loading = false;
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
