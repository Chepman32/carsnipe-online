import React from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const MainPageLeftTop = ({ focused, handleMouseEnter, onClick }) => {
  const { t } = useTranslation();
  return (
    <div className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("leftTop")} onClick={onClick}>
      <Typography.Text className="mainpage__cardText_black">
        {t('header.mainPage.myCars')}
      </Typography.Text>
    </div>
  );
};

export default MainPageLeftTop;
