import React, { useState } from "react";
import "./quickSettingsMenu.css";

export const QuickSettingsMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="quick-settings-container">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Windows_Settings_icon.svg/2184px-Windows_Settings_icon.svg.png"
        alt="Settings"
        className="settings-button"
        onClick={toggleMenu}
      />
      <div className={`settings-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="settings-menu-item">
          <img src="https://cdn-icons-png.flaticon.com/512/5262/5262027.png" alt="Dark Mode" />
          <span>Dark Mode</span>
        </div>
        <div className="settings-menu-item">
          <img
            src="https://static.vecteezy.com/system/resources/previews/011/934/413/non_2x/silver-music-note-icon-free-png.png"
            alt="Music"
          />
          <span>Music</span>
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