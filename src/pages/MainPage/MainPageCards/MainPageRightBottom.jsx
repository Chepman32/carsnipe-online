import React from 'react'
import { Typography } from 'antd'
import { useTranslation } from 'react-i18next';

const MainPageRightBottom = ({ focused, handleMouseEnter, onClick }) => {
  const { t } = useTranslation();
  return (
    <div className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("rightBottom")} onClick={onClick}>
      <Typography.Text className="mainpage__cardText_black">
        {t('header.mainPage.profile')}
      </Typography.Text>
    </div>
  )
}

export default MainPageRightBottom
