import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDarkMode: false,
  emailNotifications: true,
  profilePublic: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    toggleEmailNotifications: (state) => {
      state.emailNotifications = !state.emailNotifications;
    },
    toggleProfileVisibility: (state) => {
      state.profilePublic = !state.profilePublic;
    },
  },
});

export const {
  toggleDarkMode,
  toggleEmailNotifications,
  toggleProfileVisibility,
} = settingsSlice.actions;

export default settingsSlice.reducer;
