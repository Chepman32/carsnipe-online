import { Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MainPageRightTop = ({ focused, handleMouseEnter }) => {
  const { t } = useTranslation();
  return (
    <Link to="/store" className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("rightTop")}>
      <Typography.Text className="mainpage__cardText_black">
        {t('header.mainPage.bank')}
      </Typography.Text>
    </Link>
  );
};

export default MainPageRightTop;
