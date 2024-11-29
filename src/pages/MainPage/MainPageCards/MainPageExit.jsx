import React from "react";
import { Typography } from "antd";

const MainPageExit = ({ focused, handleMouseEnter }) => {
  const handleExit = () => {
    if (window.electron?.quitApp) {
      window.electron.quitApp();
    } else {
      console.error("Electron quit functionality is not available.");
    }
  };

  return (
    <div
      className={`tile ${focused ? "focused" : ""}`}
      onClick={handleExit}
      onMouseEnter={() => handleMouseEnter("exitBtn")}
    >
      <Typography.Text className="mainpage__cardText_black">
        Quit
      </Typography.Text>
    </div>
  );
};

export default MainPageExit;