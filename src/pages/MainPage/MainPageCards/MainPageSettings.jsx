// MainPageSettings.js
import React from "react";
import { Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MainPageSettings = ({ focused, handleMouseEnter }) => {
  const { t } = useTranslation();
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
        {t('header.mainPage.settings')}
      </Typography.Text>
    </div>
  );
};

export default MainPageSettings;
