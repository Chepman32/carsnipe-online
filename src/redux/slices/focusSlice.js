// focusSlice.js

import { createSlice } from "@reduxjs/toolkit";

export const FOCUS_ZONES = {
  HEADER: "HEADER",
  PAGE: "PAGE",
  SETTINGS: "SETTINGS"
};

export const HEADER_MAIN_MENU = "HEADER_MAIN_MENU";
export const HEADER_CARS_STORE = "HEADER_CARS_STORE";
export const HEADER_MY_CARS = "HEADER_MY_CARS";
export const HEADER_AUCTIONS = "HEADER_AUCTIONS";
export const HEADER_STORE = "HEADER_STORE";
export const HEADER_PROFILE = "HEADER_PROFILE";

export const SETTINGS_DARK_MODE = "SETTINGS_DARK_MODE";
export const SETTINGS_SOUND_EFFECTS = "SETTINGS_SOUND_EFFECTS";
export const SETTINGS_MUSIC_VOLUME = "SETTINGS_MUSIC_VOLUME";

export const TOP_CAR = "TOP_CAR";

const initialState = {
  focusedZone: FOCUS_ZONES.PAGE,
  currentFocusedElement: "PAGE_MAIN_CONTENT",
  currentSettingsElement: SETTINGS_DARK_MODE,
  currentRoute: "/",
  isTopCar: false
};

const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {
    handleKeyDown(state, action) {
      const key = action.payload;
      switch (state.focusedZone) {
        case FOCUS_ZONES.HEADER:
          if (key === "ArrowUp") {
            return;
          } else if (key === "ArrowLeft") {
            if (state.currentFocusedElement === HEADER_CARS_STORE) {
              state.currentFocusedElement = HEADER_MAIN_MENU;
            } else if (state.currentFocusedElement === HEADER_MY_CARS) {
              state.currentFocusedElement = HEADER_CARS_STORE;
            } else if (state.currentFocusedElement === HEADER_AUCTIONS) {
              state.currentFocusedElement = HEADER_MY_CARS;
            } else if (state.currentFocusedElement === HEADER_STORE) {
              state.currentFocusedElement = HEADER_AUCTIONS;
            } else if (state.currentFocusedElement === HEADER_PROFILE) {
              state.currentFocusedElement = HEADER_STORE;
            }
          } else if (key === "ArrowRight") {
            if (state.currentFocusedElement === HEADER_MAIN_MENU) {
              state.currentFocusedElement = HEADER_CARS_STORE;
            } else if (state.currentFocusedElement === HEADER_CARS_STORE) {
              state.currentFocusedElement = HEADER_MY_CARS;
            } else if (state.currentFocusedElement === HEADER_MY_CARS) {
              state.currentFocusedElement = HEADER_AUCTIONS;
            } else if (state.currentFocusedElement === HEADER_AUCTIONS) {
              state.currentFocusedElement = HEADER_STORE;
            } else if (state.currentFocusedElement === HEADER_STORE) {
              state.currentFocusedElement = HEADER_PROFILE;
            }
          } else if (key === "ArrowDown") {
            if (state.currentRoute === "/carsStore") {
              state.focusedZone = FOCUS_ZONES.PAGE;
              state.currentFocusedElement = TOP_CAR;
            }
          }
          break;
        case FOCUS_ZONES.PAGE:
          if (key === "ArrowUp") {
            // no direct check of isTopCar here; we rely on the store logic
            // to handle whether selectedCarIndex === 0 or not
          } else if (key === "ArrowDown") {
            if (state.currentFocusedElement === TOP_CAR) {
              state.currentFocusedElement = "";
            }
          }
          break;
        case FOCUS_ZONES.SETTINGS:
          if (key === "ArrowUp") {
            if (state.currentSettingsElement === SETTINGS_DARK_MODE) {
              state.focusedZone = FOCUS_ZONES.HEADER;
              state.currentFocusedElement = HEADER_MAIN_MENU;
              state.currentSettingsElement = null;
            } else if (state.currentSettingsElement === SETTINGS_SOUND_EFFECTS) {
              state.currentSettingsElement = SETTINGS_DARK_MODE;
            } else if (state.currentSettingsElement === SETTINGS_MUSIC_VOLUME) {
              state.currentSettingsElement = SETTINGS_SOUND_EFFECTS;
            }
          } else if (key === "ArrowDown") {
            if (state.currentSettingsElement === SETTINGS_DARK_MODE) {
              state.currentSettingsElement = SETTINGS_SOUND_EFFECTS;
            } else if (state.currentSettingsElement === SETTINGS_SOUND_EFFECTS) {
              state.currentSettingsElement = SETTINGS_MUSIC_VOLUME;
            }
          }
          break;
        default:
          break;
      }
    },
    setLocation: (state, action) => {
      state.currentRoute = action.payload;
    },
    setFocusedZone: (state, action) => {
      state.focusedZone = action.payload;
      if (action.payload === FOCUS_ZONES.SETTINGS && !state.currentSettingsElement) {
        state.currentSettingsElement = SETTINGS_DARK_MODE;
      }
      if (state.currentRoute === "/carsStore" && state.focusedZone !== FOCUS_ZONES.HEADER) {
        state.currentFocusedElement = TOP_CAR;
      }
    },
    setCurrentFocusedElement: (state, action) => {
      state.currentFocusedElement = action.payload;
    },
    setIsTopCar: (state, action) => {
      state.isTopCar = action.payload;
    }
  }
});

export const {
  handleKeyDown,
  setLocation,
  setFocusedZone,
  setCurrentFocusedElement,
  setIsTopCar
} = focusSlice.actions;

export default focusSlice.reducer;