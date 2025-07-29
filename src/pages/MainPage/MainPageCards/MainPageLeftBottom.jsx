import { Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const MainPageLeftBottom = ({ focused, handleMouseEnter, onClick }) => {
  const { t } = useTranslation();
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <div className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("leftBottom")} onClick={handleClick}>
      <Typography.Text className="mainpage__cardText_black" style={{ pointerEvents: 'none' }}>
        {t('header.mainPage.carsStore')}
      </Typography.Text>
    </div>
  );
};

export default MainPageLeftBottom;
