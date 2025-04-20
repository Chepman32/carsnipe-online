import React from 'react';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MainPageLeftTop = ({ focused, handleMouseEnter }) => {
  const { t } = useTranslation();
  return (
    <Link to="/mycars" className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("leftTop")}>
      <Typography.Text className="mainpage__cardText_black">
        {t('header.mainPage.myCars')}
      </Typography.Text>
    </Link>
  );
};

export default MainPageLeftTop;
