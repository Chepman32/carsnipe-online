import React, { useEffect, useRef, useState } from 'react';
import { Menu, Typography, Drawer, Button } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { MenuOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMusic, toggleDarkMode, toggleSoundEffects } from '../../redux/slices/quickSettingsSlice';
import { MenuItems } from './MenuItems';
import plus_symbol from "../../assets/icons/plus_ymbol.png";

const { Text } = Typography;

const CustomHeader = ({ nickname, avatar, money }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const closeMenuTimeout = useRef(null);
  const location = useLocation();
  const { musicOn, soundEffectsOn, darkMode } = useSelector((state) => state.quickSettings);
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

  const handleToggleSoundEffects = () => {
    dispatch(toggleSoundEffects());
  };

  const handleMouseEnterMenu = () => {
    if (closeMenuTimeout.current) {
      clearTimeout(closeMenuTimeout.current);
    }
    setIsMenuOpen(true);
  };

  const handleMouseLeaveMenu = () => {
    closeMenuTimeout.current = setTimeout(() => {
      if (!menuRef.current || !menuRef.current.matches(':hover')) {
        setIsMenuOpen(false);
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (closeMenuTimeout.current) {
        clearTimeout(closeMenuTimeout.current);
      }
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
        className={darkMode ? "customHeader dark-mode" : "customHeader light-mode"}
        style={{
          width: "100%",
          lineHeight: '64px',
          display: 'flex',
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div
          style={{
            width: "100%",
            display: 'flex',
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Button
            aria-label="Open Menu"
            className="burgerMenuButton"
            icon={<MenuOutlined />}
            onClick={toggleDrawer}
            style={{ display: isMobile ? 'block' : 'none' }}
          />
          {!isMobile && (
            <MenuItems
            />
          )}
          <section style={{ display: 'flex', alignItems: 'center' }}>
            <Link
              to="/store"
              className={isHovered ? 'storeLink scale-up' : 'storeLink scale-down'}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                background: 'transparent',
                borderLeft: location.pathname === "/store" ? '1px solid var(--border-color)' : '',
                borderRight: location.pathname === "/store" ? '1px solid var(--border-color)' : ''
              }}
            >
              <img src={plus_symbol} alt="plus_symbol" className="headerIcon" />
              <Text style={{ marginRight: 15 }} type="warning">
                {"$" + money}
              </Text>
            </Link>
            <Link
              onMouseEnter={handleMouseEnterMenu}
              onMouseLeave={handleMouseLeaveMenu}
              to="/profileEditPage"
              className="customHeader__avatar"
              style={{
                background: 'transparent',
                borderLeft: location.pathname === "/profileEditPage" || location.pathname === "/achievements" ? '1px solid var(--border-color)' : '',
                borderRight: location.pathname === "/profileEditPage" ? '1px solid var(--border-color)' : ''
              }}
              ref={menuRef}
            >
              <Typography.Text style={{ marginRight: 15, color: "var(--text-color)", fontSize: "1.4rem", fontWeight: "bold" }}>
                {nickname}
              </Typography.Text>
              <img src={avatar} alt="avatar" />
            </Link>
            <div
              className={isMenuOpen ? "settings-menu open" : "settings-menu"}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleMouseEnterMenu}
              onMouseLeave={handleMouseLeaveMenu}
              tabIndex={0}
              role="menu"
              aria-label="Settings Menu"
            >
              <div
                className="settings-menu-item"
                onClick={handleToggleDarkMode}
                role="menuitem"
                tabIndex={-1}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/5262/5262027.png"
                  alt="Dark Mode"
                />
                <span>Dark Mode: {darkMode ? "On" : "Off"}</span>
              </div>
              <div
                className="settings-menu-item"
                onClick={handleToggleMusic}
                role="menuitem"
                tabIndex={-1}
              >
                <img
                  src="https://static.vecteezy.com/system/resources/previews/011/934/413/non_2x/silver-music-note-icon-free-png.png"
                  alt="Music"
                />
                <span>Music: {musicOn ? "On" : "Off"}</span>
              </div>
              <div
                className="settings-menu-item"
                onClick={handleToggleSoundEffects}
                role="menuitem"
                tabIndex={-1}
              >
                <img
                  src="https://cdn1.iconfinder.com/data/icons/ios-and-android-line-set-2/52/call__phone__volume__sound-512.png"
                  alt="Sound"
                />
                <span>Sound: {soundEffectsOn ? "On" : "Off"}</span>
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
        open={drawerVisible}
      >
        <MenuItems
        />
      </Drawer>
      <div className="headerPlaceholder"></div>
    </>
  );
};

export default CustomHeader;