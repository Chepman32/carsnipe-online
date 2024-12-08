import React, { useState, useEffect, useRef } from 'react';
import { Button, Menu, Typography, Drawer } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { MenuOutlined } from '@ant-design/icons';
import './styles.css';
import plus_symbol from "../../assets/icons/plus_ymbol.png";
import auction_icon from "../../assets/icons/auctions.png";
import myCars_symbol from "../../assets/icons/myCars.jpg";
import carsStore_symbol from "../../assets/icons/cars_store.png";
import { MenuItems } from './MenuItems';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMusic, toggleDarkMode } from '../../redux/slices/quickSettingsSlice';

const { Text } = Typography;

const CustomHeader = ({ nickname, avatar, money }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const closeMenuTimeout = useRef(null);

  const location = useLocation();
  const { musicOn, darkMode } = useSelector((state) => state.quickSettings);
  const dispatch = useDispatch();

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleToggleMusic = () => {
    dispatch(toggleMusic());
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  const handleMouseEnterMenu = () => {
    if (closeMenuTimeout.current) {
      clearTimeout(closeMenuTimeout.current); // Cancel any pending close
    }
    setIsMenuOpen(true);
  };

  const handleMouseLeaveMenu = () => {
    closeMenuTimeout.current = setTimeout(() => {
      if (!menuRef.current?.matches(':hover')) {
        setIsMenuOpen(false);
      }
    }, 200); // Add delay to allow smoother user experience
  };

  // Remove handleMenuClick from here to allow Link navigation
  // const handleMenuClick = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation(); // Prevent link navigation and event bubbling
  // };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeMenuTimeout.current) clearTimeout(closeMenuTimeout.current);
    };
  }, []);

  if (location.pathname === "/") {
    return null;
  }

  return (
    <>
      <Menu
        theme={darkMode ? "dark" : "light"}
        mode="horizontal"
        className={`customHeader ${darkMode ? 'dark-mode' : 'light-mode'}`}
        style={{
          width: "100%",
          lineHeight: '64px',
          display: 'flex',
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            display: 'flex',
            justifyContent: "space-between",
            alignItems: "center"
          }}
          className='customHeader__content'
        >
          <Button
            className="burgerMenuButton"
            icon={<MenuOutlined />}
            onClick={toggleDrawer}
            style={{ display: isMobile ? 'block' : 'none' }}
          />

          {!isMobile && <MenuItems />}

          <section style={{ display: 'flex', alignItems: 'center' }}>
            <Link 
              to="/store"
              className={`storeLink ${isHovered ? 'scale-up' : 'scale-down'}`}
              onMouseEnter={() => setIsHovered(true)} 
              onMouseLeave={() => setIsHovered(false)}
              style={{ 
                background: 'transparent', 
                borderLeft: location.pathname === "/store" && '1px solid var(--border-color)', 
                borderRight: location.pathname === "/store" && '1px solid var(--border-color)' 
              }}
            >
              <img src={plus_symbol} alt="plus_symbol" className="headerIcon" />
              <Text style={{ marginRight: 15 }} type="warning">{`$${money}`}</Text>
            </Link>
            <Link
  onMouseEnter={handleMouseEnterMenu}
  onMouseLeave={handleMouseLeaveMenu}
  to="/profileEditPage"
  className="customHeader__avatar"
  style={{
    background: 'transparent',
    borderLeft: (location.pathname === "/profileEditPage" || location.pathname === "/achievements") && '1px solid var(--border-color)',
    borderRight: location.pathname === "/profileEditPage" && '1px solid var(--border-color)'
  }}
  ref={menuRef}
>
  <Typography.Text style={{ marginRight: 15, color: "var(--text-color)", fontSize: "1.4rem", fontWeight: "bold" }}>
    {nickname}
  </Typography.Text>
  <img src={avatar} alt="avatar" />
</Link>

{/* Move the settings menu outside the Link */}
<div
  className={`settings-menu ${isMenuOpen ? "open" : ""}`}
  onClick={(e) => e.stopPropagation()}
  onMouseEnter={handleMouseEnterMenu}
  onMouseLeave={handleMouseLeaveMenu}
>
  <div className="settings-menu-item" onClick={handleToggleDarkMode}>
    <img src="https://cdn-icons-png.flaticon.com/512/5262/5262027.png" alt="Dark Mode" />
    <span>Dark Mode: {darkMode ? "On" : "Off"}</span>
  </div>
  <div className="settings-menu-item" onClick={handleToggleMusic}>
    <img src="https://static.vecteezy.com/system/resources/previews/011/934/413/non_2x/silver-music-note-icon-free-png.png" alt="Music" />
    <span>Music: {musicOn ? "On" : "Off"}</span>
  </div>
  <div className="settings-menu-item">
    <img
      src="https://cdn1.iconfinder.com/data/icons/ios-and-android-line-set-2/52/call__phone__volume__sound-512.png"
      alt="Sound"
    />
    <span>Sound</span>
  </div>
</div>
          </section>
        </div>
      </Menu>
      <Drawer
        title="Menu"
        placement="left"
        closable={true}
        onClose={toggleDrawer}
        visible={drawerVisible}
      >
        <MenuItems />
      </Drawer>
      <div className="headerPlaceholder"></div>
    </>
  );
};

export default CustomHeader;