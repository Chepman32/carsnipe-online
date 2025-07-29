import React from 'react'
import { Typography } from 'antd'
import { useTranslation } from 'react-i18next';

const MainPageRightBottom = ({ focused, handleMouseEnter, onClick }) => {
  const { t } = useTranslation();
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <div className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("rightBottom")} onClick={handleClick}>
      <Typography.Text className="mainpage__cardText_black" style={{ pointerEvents: 'none' }}>
        {t('header.mainPage.profile')}
      </Typography.Text>
    </div>
  )
}

export default MainPageRightBottom
