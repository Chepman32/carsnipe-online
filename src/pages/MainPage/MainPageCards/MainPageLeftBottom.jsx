import { Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const MainPageLeftBottom = ({ focused, handleMouseEnter, onClick }) => {
  const { t } = useTranslation();
  return (
    <div className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("leftBottom")} onClick={onClick}>
      <Typography.Text className="mainpage__cardText_black">
        {t('header.mainPage.carsStore')}
      </Typography.Text>
    </div>
  );
};

export default MainPageLeftBottom;
