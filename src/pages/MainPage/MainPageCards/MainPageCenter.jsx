import { Typography } from 'antd';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MainPageCenter = ({ focused, handleMouseEnter, onClick, isMenuOpen }) => {

  const navigate = useNavigate();

  const handleClick = () => {
    !isMenuOpen && navigate("/auctionsHub");
  };
  return (
    <div className={`tile ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("center")} onClick={handleClick}>
      <Typography.Text className="mainpage__cardText_black">
        Auctions
      </Typography.Text>
    </div>
  );
};

export default MainPageCenter;

