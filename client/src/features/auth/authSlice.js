import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api";


export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("No token found");
    }
    try {
   
      const response = await API.get("/admin/me");
      return response.data;
    } catch (error) {
  
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return rejectWithValue("Token is invalid or expired");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    role: null,
    loading: true, 
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.role = action.payload.user.role;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.role = action.payload.role;
        state.loading = false;
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