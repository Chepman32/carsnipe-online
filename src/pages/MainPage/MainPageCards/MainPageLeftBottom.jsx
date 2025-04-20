import { Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MainPageLeftBottom = ({ focused, handleMouseEnter }) => {
  const { t } = useTranslation();
  return (
    <Link to="/carsStore" className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("leftBottom")}    >
      <Typography.Text className="mainpage__cardText_black">
        {t('header.mainPage.carsStore')}
      </Typography.Text>
    </Link>
  );
};

export default MainPageLeftBottom;
