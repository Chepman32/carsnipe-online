import { Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const MainPageRightTop = ({ focused, handleMouseEnter, onClick }) => {
  const { t } = useTranslation();
  return (
    <div className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("rightTop")} onClick={onClick}>
      <Typography.Text className="mainpage__cardText_black">
        {t('header.mainPage.bank')}
      </Typography.Text>
    </div>
  );
};

export default MainPageRightTop;
