import { Typography } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const MainPageCenter = ({ focused, handleMouseEnter, onClick, isMenuOpen }) => {
  const { t } = useTranslation();

  const { darkMode } = useSelector((state) => state.quickSettings);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isMenuOpen && onClick) {
      onClick();
    }
  };
  return (
    <div className={`tile ${darkMode ? 'darkTile' : ''} ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("center")} onClick={handleClick}>
      <Typography.Text className="mainpage__cardText_black" style={{ pointerEvents: 'none' }}>
        {t('header.mainPage.auctions')}
      </Typography.Text>
    </div>
  );
};

export default MainPageCenter;
