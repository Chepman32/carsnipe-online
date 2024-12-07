// src/components/QuickSettingsMenu/QuickSettingsMenu.jsx

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleMusic } from "../../redux/slices/quickSettingsSlice"; // Corrected import path
import "./quickSettingsMenu.css";
import { Link } from "react-router-dom";

export const QuickSettingsMenu = ({isMenuOpen, setIsMenuOpen}) => {
  const dispatch = useDispatch();
  const { musicOn } = useSelector((state) => state.quickSettings);

  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(() => !isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleMusic = () => {
    dispatch(toggleMusic());
  };

  return (
    <div className="quick-settings-container" ref={menuRef}>
      <Link to="/settings">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Windows_Settings_icon.svg/2184px-Windows_Settings_icon.svg.png"
        alt="Settings"
        className="settings-button"
        onClick={toggleMenu}
      /></Link>
      <div className={`settings-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="settings-menu-item">
          <img src="https://cdn-icons-png.flaticon.com/512/5262/5262027.png" alt="Dark Mode" />
          <span>Dark Mode</span>
        </div>
        <div className="settings-menu-item" onClick={handleToggleMusic}>
          <img
            src="https://static.vecteezy.com/system/resources/previews/011/934/413/non_2x/silver-music-note-icon-free-png.png"
            alt="Music"
          />
          <span>Music: {musicOn ? "On" : "Off"}</span>
        </div>
        <div className="settings-menu-item">
          <img
            src="https://cdn1.iconfinder.com/data/icons/ios-and-android-line-set-2/52/call__phone__volume__sound-512.png"
            alt="Sound"
          />
          <span>Sound</span>
        </div>
      </div>
    </div>
  );
};