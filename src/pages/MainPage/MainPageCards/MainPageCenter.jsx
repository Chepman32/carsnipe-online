import { Typography } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MainPageCenter = ({ focused, handleMouseEnter, onClick, isMenuOpen }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { darkMode } = useSelector((state) => state.quickSettings);

  const handleClick = () => {
    !isMenuOpen && navigate("/auctionsHub");
  };
  return (
    <div className={`tile ${darkMode ? 'darkTile' : ''} ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("center")} onClick={handleClick}>
      <Typography.Text className="mainpage__cardText_black">
        {t('header.mainPage.auctions')}
      </Typography.Text>
    </div>
  );
};

export default MainPageCenter;
