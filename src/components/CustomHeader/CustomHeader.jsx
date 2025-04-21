import React, { useEffect, useRef, useState } from 'react';
import { Menu, Typography, Drawer, Button, ConfigProvider } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isMobile as isMobileDevice } from 'react-device-detect';
import { MenuOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import {
  toggleMusic,
  toggleDarkMode,
  toggleSoundEffects
} from '../../redux/slices/quickSettingsSlice';
import { MenuItems } from './MenuItems';
import drawer from "../../assets/icons/drawer.png";
import plus_symbol from '../../assets/icons/plus_ymbol.png';
import {
  FOCUS_ZONES,
  HEADER_MAIN_MENU,
  HEADER_PROFILE,
  HEADER_STORE,
  HEADER_CARS_STORE,
  HEADER_MY_CARS,
  HEADER_AUCTIONS,
  HEADER_MESSENGER,
  QUICK_MENU_DARK_MODE,
  QUICK_MENU_MUSIC,
  QUICK_MENU_SOUND,
  handleKeyDown,
  setCurrentFocusedElement,
  setIsQuickMenuOpen
} from '../../redux/slices/focusSlice';
import { setMusicVolume } from '../../redux/slices/mainSettingsSlice';
import {
  playNextStation,
  playPreviousStation
} from '../../redux/slices/musicPlayerSlice';
import fastForward from "../../assets/icons/fast-forward.png";
import rewind from "../../assets/icons/rewind.png";

const { Text, Title } = Typography;

const CustomHeader = ({ nickname, avatar, money }) => {
  const { t } = useTranslation(); // Get translation function
  const [isHovered, setIsHovered] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const profileMenuContainerRef = useRef(null);
  const closeMenuTimeout = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { musicOn, soundEffectsOn, darkMode } = useSelector((state) => state.quickSettings);
  const { musicVolume } = useSelector((state) => state.mainSettings);
  const { focusedZone, currentFocusedElement, isQuickMenuOpen } = useSelector((state) => state.focus);
  const { currentStation } = useSelector((state) => state.musicPlayer);

  const toggleDrawer = () => {
    console.log('Toggle drawer, current state:', drawerVisible);
    console.log('Current device info:', {
      isMobileState: isMobile,
      isMobileFromLibrary: isMobileDevice,
      userAgent: navigator.userAgent,
      windowWidth: window.innerWidth
    });
    setDrawerVisible(prevState => {
      console.log('Setting drawer to:', !prevState);
      return !prevState;
    });
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const handleToggleMusic = () => {
    if (musicVolume <= 0) {
      dispatch(setMusicVolume(50));
    }
    dispatch(toggleMusic());
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  const handleToggleSoundEffects = () => {
    dispatch(toggleSoundEffects());
  };

  const handleMouseEnterContainer = () => {
    if (closeMenuTimeout.current) {
      clearTimeout(closeMenuTimeout.current);
      closeMenuTimeout.current = null;
    }
    setIsMenuOpen(true);
    dispatch(setIsQuickMenuOpen(true));
  };

  const handleMouseLeaveContainer = () => {
    closeMenuTimeout.current = setTimeout(() => {
      setIsMenuOpen(false);
      if (focusedZone !== FOCUS_ZONES.QUICK_MENU && currentFocusedElement !== HEADER_PROFILE) {
        dispatch(setIsQuickMenuOpen(false));
      }
    }, 100); // Small delay to prevent menu from closing when moving between elements
  };

  useEffect(() => {
    const keyDownHandler = (event) => {
      dispatch(handleKeyDown(event.key));
      if (event.key === 'Enter') {
        switch (currentFocusedElement) {
          case 'HEADER_MAIN_MENU':
            navigate('/');
            closeDrawer();
            break;
          case 'HEADER_CARS_STORE':
            navigate('/carsStore');
            closeDrawer();
            break;
          case 'HEADER_MY_CARS':
            navigate('/myCars');
            closeDrawer();
            break;
          case 'HEADER_AUCTIONS':
            navigate('/auctionsHub');
            closeDrawer();
            break;
          case HEADER_STORE:
            navigate('/store');
            closeDrawer();
            break;
          case HEADER_PROFILE:
            navigate('/profileEditPage');
            closeDrawer();
            break;
          case QUICK_MENU_DARK_MODE:
            dispatch(toggleDarkMode());
            break;
          case QUICK_MENU_MUSIC:
            handleToggleMusic();
            break;
          case QUICK_MENU_SOUND:
            dispatch(toggleSoundEffects());
            break;
          default:
            break;
        }
      }
      else if(event.key === 'Escape') {
        dispatch(setIsQuickMenuOpen(false));
        dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
        closeDrawer();
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [
    dispatch,
    navigate,
    currentFocusedElement
  ]);

  useEffect(() => {
    if (currentFocusedElement === HEADER_PROFILE) {
      dispatch(setIsQuickMenuOpen(true));
    } else if (focusedZone !== FOCUS_ZONES.QUICK_MENU) {
      dispatch(setIsQuickMenuOpen(false));
    }
  }, [currentFocusedElement, focusedZone, dispatch]);

  useEffect(() => {
    console.log('Drawer visibility changed to:', drawerVisible);
    console.log('isMobile state:', isMobile);
    console.log('isMobileDevice from library:', isMobileDevice);
    
    // Close drawer when switching from mobile to desktop
    if (!isMobile && drawerVisible) {
      setDrawerVisible(false);
    }
  }, [isMobile, drawerVisible, isMobileDevice]);

  useEffect(() => {
    return () => {
      if (closeMenuTimeout.current) {
        clearTimeout(closeMenuTimeout.current);
        closeMenuTimeout.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      // Use both the imported isMobileDevice and a screen size check
      // This ensures the drawer shows on both real mobile devices and small browser windows
      const isSmallScreen = window.innerWidth <= 768;
      const shouldShowMobile = isMobileDevice || isSmallScreen;
      
      console.log('Mobile detection:', {
        isMobileFromLibrary: isMobileDevice,
        isSmallScreen,
        finalResult: shouldShowMobile
      });
      
      setIsMobile(shouldShowMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (location.pathname === '/') {
    return null;
  }

  return (
    <ConfigProvider>
      <Menu
        theme={darkMode ? 'dark' : 'light'}
        mode="horizontal"
        className={darkMode ? 'customHeader dark-mode' : 'customHeader light-mode'}
        style={{
          width: '100%',
          lineHeight: '64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative' // Add this to ensure proper stacking context
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative' // Add this to ensure proper stacking context
          }}
        >
          <div
            onClick={toggleDrawer}
            style={{
              display: isMobile || isMobileDevice ? 'flex' : 'none', // Use both checks
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '8px',
              marginRight: '8px',
              zIndex: 1000,
              position: 'relative'
            }}
          >
            <img 
              src={drawer} 
              className='burgerMenuIcon' 
              alt={t('header.alt.drawer')} 
              style={{ 
                width: '24px', 
                height: '24px',
                filter: darkMode ? 'invert(1)' : 'none',
                display: 'block'
              }} 
            />
          </div>
          {!isMobile && !isMobileDevice && <MenuItems />}
          {!isMobile && !isMobileDevice && (
            <section style={{ display: 'flex', alignItems: 'center' }}>
              <Link
                to="/store"
                className={isHovered ? 'storeLink scale-up' : 'storeLink scale-down'}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  background:
                    location.pathname === '/store'
                      ? 'rgba(42, 72, 234, 0.57)'
                      : 'transparent',
                  border:
                    focusedZone === FOCUS_ZONES.HEADER &&
                    currentFocusedElement === HEADER_STORE
                      ? '2px solid red'
                      : 'none'
                }}
                tabIndex={0}
              >
                <img src={plus_symbol} alt={t('header.alt.store')} className="headerIcon" />
                <Text
                  style={{
                    marginRight: 15,
                    fontWeight: 'bold',
                    color: darkMode ? '#ffdd00' : '#000000',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {'$' + (money || 0)}
                </Text>
              </Link>
              <div
                ref={profileMenuContainerRef}
                onMouseEnter={handleMouseEnterContainer}
                onMouseLeave={handleMouseLeaveContainer}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Link
                  to="/profileEditPage"
                  className="customHeader__avatar"
                  style={{
                    padding: '0.45rem',
                    background:
                      location.pathname === '/profileEditPage' ||
                      location.pathname === '/achievements'
                        ? 'rgba(42, 72, 234, 0.57)'
                        : 'transparent',
                    border:
                      focusedZone === FOCUS_ZONES.HEADER &&
                      currentFocusedElement === HEADER_PROFILE
                        ? '2px solid red'
                        : 'none',
                    borderRadius: '.7rem'
                  }}
                  ref={menuRef}
                  tabIndex={0}
                >
                  <Text
                    style={{
                      marginRight: 15,
                      color: 'var(--text-color)',
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      maxWidth: '150px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {nickname || t('common.user')}
                  </Text>
                  <img src={avatar || 'https://via.placeholder.com/40'} alt={t('header.alt.avatar')} />
                </Link>
                <div
                  className={
                    isMenuOpen ||
                    isQuickMenuOpen ||
                    currentFocusedElement === HEADER_PROFILE ||
                    focusedZone === FOCUS_ZONES.QUICK_MENU
                      ? 'settings-menu open'
                      : 'settings-menu'
                  }
                  onClick={(e) => e.stopPropagation()}
                  tabIndex={0}
                  role="menu"
                  aria-label={t('header.quickSettings.ariaLabel')}
                >
                  <div
                    className={`settings-menu-item ${
                      focusedZone === FOCUS_ZONES.QUICK_MENU &&
                      currentFocusedElement === QUICK_MENU_DARK_MODE
                        ? 'focused'
                        : ''
                    }`}
                    onClick={handleToggleDarkMode}
                    role="menuitem"
                    tabIndex={-1}
                    style={{ display: 'flex', alignItems: 'center' }}
                >
                    {darkMode ? (
                      <BulbFilled style={{ fontSize: '20px', color: '#ffdd00' }} />
                    ) : (
                      <BulbOutlined style={{ fontSize: '20px' }} />
                    )}
                    <span style={{ marginLeft: '10px' }}>{t('header.quickSettings.darkMode')}: {darkMode ? t('common.on') : t('common.off')}</span>
                </div>
                  <div
                    className={`settings-menu-item ${
                      focusedZone === FOCUS_ZONES.QUICK_MENU &&
                      currentFocusedElement === QUICK_MENU_MUSIC
                        ? 'focused'
                        : ''
                    }`}
                    onClick={handleToggleMusic}
                    role="menuitem"
                    tabIndex={-1}
                >
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/011/934/413/non_2x/silver-music-note-icon-free-png.png"
                    alt={t('header.alt.music')}
                  />
                  <span>{t('header.quickSettings.music')}: {musicOn ? t('common.on') : t('common.off')}</span>
                </div>
                  <div
                    className={`settings-menu-item ${
                      focusedZone === FOCUS_ZONES.QUICK_MENU &&
                      currentFocusedElement === QUICK_MENU_SOUND
                        ? 'focused'
                        : ''
                    }`}
                    onClick={handleToggleSoundEffects}
                    role="menuitem"
                    tabIndex={-1}
                >
                  <img
                    src="https://cdn1.iconfinder.com/data/icons/ios-and-android-line-set-2/52/call__phone__volume__sound-512.png"
                    alt={t('header.alt.sound')}
                  />
                  <span>{t('header.quickSettings.sound')}: {soundEffectsOn ? t('common.on') : t('common.off')}</span>
                </div>
                  <Title
                    level={5}
                    style={{
                      margin: '8px 0',
                      textAlign: 'center',
                      color: 'var(--text-color)',
                      fontWeight: 800
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentStation && (
                      <img
                        src={currentStation.icon}
                        alt={currentStation.name}
                        style={{ width: '24px', height: '24px', marginRight: '8px' }}
                      />
                    )}
                    {currentStation ? currentStation.name : ''}
                  </div>
                </Title>
                  <div className="settings-menu-item station-controls">
                    <button
                      onClick={() => dispatch(playPreviousStation())}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <img
                        src={rewind}
                        alt={t('header.alt.previousStation')}
                        style={{ width: '24px', height: '24px' }}
                      />
                    </button>
                    <button
                      onClick={() => dispatch(playNextStation())}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <img
                        src={fastForward}
                        alt={t('header.alt.nextStation')}
                        style={{ width: '24px', height: '24px' }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </Menu>
      {/* Custom Mobile Drawer */}
      <div className={`custom-mobile-drawer-overlay ${drawerVisible ? 'open' : ''}`} onClick={closeDrawer}></div>
      <div className={`custom-mobile-drawer ${drawerVisible ? 'open' : ''}`}>
        <div className="custom-mobile-drawer-header">
          <h3 className="custom-mobile-drawer-title">{t('header.drawer.menu')}</h3>
          <button className="custom-mobile-drawer-close" onClick={closeDrawer} aria-label={t('header.drawer.close')}>×</button>
        </div>
        <div className="custom-mobile-drawer-content">
          {/* Profile Link */}
          <Link
            to="/profileEditPage"
            className="drawer__avatar"
            onClick={closeDrawer}
            style={{
              padding: '12px 16px',
              background:
                location.pathname === '/profileEditPage' ||
                location.pathname === '/achievements'
                  ? 'rgba(42, 72, 234, 0.57)'
                  : 'transparent',
              border:
                focusedZone === FOCUS_ZONES.HEADER &&
                currentFocusedElement === HEADER_PROFILE
                  ? '2px solid red'
                  : 'none',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
          >
            <Text
              style={{
                marginRight: 15,
                color: 'var(--text-color)',
                fontSize: '1.6rem',
                fontWeight: '700',
                maxWidth: '150px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {nickname}
            </Text>
            <img src={avatar} alt={t('header.alt.avatar')} />
          </Link>

          {/* Store Link */}
          <div className="header__drawer__item" style={{ width: '100%' }}>
            <Link
              to="/store"
              onClick={closeDrawer}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                textDecoration: 'none',
                background:
                  location.pathname === '/store'
                    ? 'rgba(42, 72, 234, 0.57)'
                    : 'transparent'
              }}
            >
              <img src={plus_symbol} alt={t('header.alt.store')} className="headerIcon" />
              <Text
                style={{
                  marginLeft: 10,
                  fontWeight: '700',
                  color: darkMode ? '#ffdd00' : '#000000',
                  fontSize: '1.6rem',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              >
                {'$' + money}
              </Text>
            </Link>
          </div>

          {/* Main Menu Link */}
          <div
            className="header__drawer__item"
            style={{
              background: location.pathname === '/' ? 'rgba(42, 72, 234, 0.57)' : 'transparent',
              border: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_MAIN_MENU ? '2px solid red' : 'none',
            }}
          >
            <Link to="/" onClick={closeDrawer} style={{ color: 'var(--text-color)', textDecoration: 'none', width: '100%' }}>
              <Text style={{ fontSize: '1.6rem', fontWeight: '500' }}>{t('header.drawer.mainMenu')}</Text>
            </Link>
          </div>

          {/* Cars Store Link */}
          <div
            className="header__drawer__item"
            style={{
              background: location.pathname === '/carsStore' ? 'rgba(42, 72, 234, 0.57)' : 'transparent',
              border: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_CARS_STORE ? '2px solid red' : 'none',
            }}
          >
            <Link to="/carsStore" onClick={closeDrawer} style={{ color: 'var(--text-color)', textDecoration: 'none', width: '100%' }}>
              <Text style={{ fontSize: '1.6rem', fontWeight: '500' }}>{t('header.drawer.carsStore')}</Text>
            </Link>
          </div>

          {/* My Cars Link */}
          <div
            className="header__drawer__item"
            style={{
              background: location.pathname === '/myCars' ? 'rgba(42, 72, 234, 0.57)' : 'transparent',
              border: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_MY_CARS ? '2px solid red' : 'none',
            }}
          >
            <Link to="/myCars" onClick={closeDrawer} style={{ color: 'var(--text-color)', textDecoration: 'none', width: '100%' }}>
              <Text style={{ fontSize: '1.6rem', fontWeight: '500' }}>{t('header.drawer.myCars')}</Text>
            </Link>
          </div>

          {/* Auctions Link */}
          <div
            className="header__drawer__item"
            style={{
              background: location.pathname === '/auctionsHub' ? 'rgba(42, 72, 234, 0.57)' : 'transparent',
              border: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_AUCTIONS ? '2px solid red' : 'none',
            }}
          >
            <Link to="/auctionsHub" onClick={closeDrawer} style={{ color: 'var(--text-color)', textDecoration: 'none', width: '100%' }}>
              <Text style={{ fontSize: '1.6rem', fontWeight: '500' }}>{t('header.drawer.auctions')}</Text>
            </Link>
          </div>

          {/* Messages Link */}
          <div
            className="header__drawer__item"
            style={{
              background: location.pathname === '/messenger' ? 'rgba(42, 72, 234, 0.57)' : 'transparent',
              border: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_MESSENGER ? '2px solid red' : 'none',
            }}
          >
            <Link to="/messenger" onClick={closeDrawer} style={{ color: 'var(--text-color)', textDecoration: 'none', width: '100%' }}>
              <Text style={{ fontSize: '1.6rem', fontWeight: '500' }}>{t('header.drawer.messages')}</Text>
            </Link>
          </div>
        </div>
      </div>
      <div className="headerPlaceholder"></div>
    </ConfigProvider>
  );
};

export default CustomHeader;
