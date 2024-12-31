// MainPageSettings.js
import React from "react";
import { Typography } from "antd";
import { useNavigate } from "react-router-dom";

const MainPageSettings = ({ focused, handleMouseEnter }) => {

    const navigate = useNavigate();
  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <div
      className={`tile ${focused ? "focused" : ""}`}
      onClick={handleSettings}
      onMouseEnter={() => handleMouseEnter("settingsBtn")}
    >
      <Typography.Text className="mainpage__cardText_black">
        Settings
      </Typography.Text>
    </div>
  );
};

export default MainPageSettings;