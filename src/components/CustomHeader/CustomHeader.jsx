import React, { useState, useEffect, useRef } from 'react';
import { Button, Menu, Typography, Drawer } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { MenuOutlined } from '@ant-design/icons';
import './styles.css';
import plus_symbol from "../../assets/icons/plus_ymbol.png";
import { useDispatch, useSelector } from 'react-redux';
import { toggleMusic, toggleDarkMode, toggleSoundEffects } from '../../redux/slices/quickSettingsSlice';
import { useFocus } from '../../shared/FocusContext';
import { FOCUS_ZONES } from '../../shared/elementKeys';
import { useSelectedElement } from '../../shared/useSelectedElement';
import { MenuItems } from './MenuItems';

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

  const { focusedZone, setFocusedZone } = useFocus();
  const { selectedElement, handleElementSelect } = useSelectedElement();

  

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
    setFocusedZone(FOCUS_ZONES.HEADER);
  };

  const handleMouseLeaveMenu = () => {
    closeMenuTimeout.current = setTimeout(() => {
      if (!menuRef.current?.matches(':hover')) {
        setIsMenuOpen(false);
        setFocusedZone(FOCUS_ZONES.PAGE);
      }
    }, 200);
  };

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
        onFocus={() => setFocusedZone(FOCUS_ZONES.HEADER)}
        onBlur={() => setFocusedZone(FOCUS_ZONES.PAGE)}
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
            aria-label="Open Menu"
            className="burgerMenuButton"
            icon={<MenuOutlined />}
            onClick={toggleDrawer}
            style={{ display: isMobile ? 'block' : 'none' }}
            onFocus={() => setFocusedZone(FOCUS_ZONES.HEADER)}
            onBlur={() => setFocusedZone(FOCUS_ZONES.PAGE)}
          />

          {!isMobile && <MenuItems selectedElement={selectedElement} handleElementSelect={handleElementSelect} />}

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
              onFocus={() => setFocusedZone(FOCUS_ZONES.HEADER)}
              onBlur={() => setFocusedZone(FOCUS_ZONES.PAGE)}
              aria-label="Store Link"
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
              onFocus={() => setFocusedZone(FOCUS_ZONES.HEADER)}
              onBlur={() => setFocusedZone(FOCUS_ZONES.PAGE)}
              aria-label="Profile Edit Page Link"
            >
              <Typography.Text style={{ marginRight: 15, color: "var(--text-color)", fontSize: "1.4rem", fontWeight: "bold" }}>
                {nickname}
              </Typography.Text>
              <img src={avatar} alt="avatar" />
            </Link>

            <div
              className={`settings-menu ${isMenuOpen ? "open" : ""}`}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleMouseEnterMenu}
              onMouseLeave={handleMouseLeaveMenu}
              onFocus={() => setFocusedZone(FOCUS_ZONES.HEADER)}
              onBlur={() => setFocusedZone(FOCUS_ZONES.PAGE)}
              tabIndex={0}
              role="menu"
              aria-label="Settings Menu"
            >
              <div className="settings-menu-item" onClick={handleToggleDarkMode} role="menuitem" tabIndex={-1}>
                <img src="https://cdn-icons-png.flaticon.com/512/5262/5262027.png" alt="Dark Mode" />
                <span>Dark Mode: {darkMode ? "On" : "Off"}</span>
              </div>
              <div className="settings-menu-item" onClick={handleToggleMusic} role="menuitem" tabIndex={-1}>
                <img src="https://static.vecteezy.com/system/resources/previews/011/934/413/non_2x/silver-music-note-icon-free-png.png" alt="Music" />
                <span>Music: {musicOn ? "On" : "Off"}</span>
              </div>
              <div className="settings-menu-item" onClick={handleToggleSoundEffects} role="menuitem" tabIndex={-1}>
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
        visible={drawerVisible}
      >
        <MenuItems selectedElement={selectedElement} handleElementSelect={handleElementSelect} />
      </Drawer>
      <div className="headerPlaceholder"></div>
    </>
  );
};

export default CustomHeader;