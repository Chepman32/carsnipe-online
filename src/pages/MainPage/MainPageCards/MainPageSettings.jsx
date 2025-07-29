// MainPageSettings.js
import React from "react";
import { Typography } from "antd";
import { useTranslation } from "react-i18next";

const MainPageSettings = ({ focused, handleMouseEnter, onClick }) => {
  const { t } = useTranslation();
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`tile ${focused ? "focused" : ""}`}
      onClick={handleClick}
      onMouseEnter={() => handleMouseEnter("settingsBtn")}
    >
      <Typography.Text className="mainpage__cardText_black" style={{ pointerEvents: 'none' }}>
        {t('header.mainPage.settings')}
      </Typography.Text>
    </div>
  );
};

export default MainPageSettings;
