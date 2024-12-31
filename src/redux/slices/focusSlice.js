// focusSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  focusedSection: 'header'
};

const focusSlice = createSlice({
  name: 'focus',
  initialState,
  reducers: {
    setFocusedSection(state, action) {
      state.focusedSection = action.payload;
    }
  }
});

export const { setFocusedSection } = focusSlice.actions;
export default focusSlice.reducer;