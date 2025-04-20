import React from 'react'
import { Card, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';

const MainPageRightBottom = ({ focused, handleMouseEnter }) => {
  const { t } = useTranslation();
  return (
    <Link to="/profileEditPage" className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("rightBottom")}>
      <Typography.Text className="mainpage__cardText_black">
        {t('header.mainPage.profile')}
      </Typography.Text>
    </Link>
  )
}

export default MainPageRightBottom
