import { Menu } from 'antd';
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  FOCUS_ZONES,
  HEADER_MAIN_MENU,
  HEADER_CARS_STORE,
  HEADER_MY_CARS,
  HEADER_AUCTIONS,
  HEADER_MESSENGER,
  HEADER_LAST_OPTION,
  handleKeyDown as handleKeyDownAction,
} from '../../redux/slices/focusSlice';

export const MenuItems = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentFocusedElement, focusedZone } = useSelector((state) => state.focus);

  const handleKeyDown = (event) => {
    dispatch(handleKeyDownAction(event.key));
    if (event.key === 'Enter') {
      switch (currentFocusedElement) {
        case HEADER_MAIN_MENU:
          navigate('/');
          break;
        case HEADER_CARS_STORE:
          navigate('/carsStore');
          break;
        case HEADER_MY_CARS:
          navigate('/myCars');
          break;
        case HEADER_AUCTIONS:
          navigate('/auctionsHub');
          break;
        case HEADER_MESSENGER:
          navigate('/messenger');
          break;
        case HEADER_LAST_OPTION:
          navigate('/desiredPage');
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.HEADER) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentFocusedElement, focusedZone, dispatch, navigate]);

  const getBackground = (path) => {
    if (path === '/') {
      return location.pathname === '/' ? 'red' : 'transparent';
    }
    return location.pathname === path
      ? 'rgba(42, 72, 234, 0.57)'
      : 'transparent';
  };

  const getBorder = (element) => {
    return focusedZone === FOCUS_ZONES.HEADER &&
      currentFocusedElement === element
      ? '2px solid red'
      : 'none';
  };

  return (
    <section className='customHeader__menu'>
      <Menu.Item
        key="mainMenu"
        style={{
          background: getBackground('/'),
          border: getBorder(HEADER_MAIN_MENU),
          borderRight:
            focusedZone === FOCUS_ZONES.HEADER &&
            currentFocusedElement === HEADER_MAIN_MENU
              ? '2px solid red'
              : 'none',
        }}
        className="customHeader__menuItem"
      >
        <Link to="/">
          <h2 style={{ fontWeight: 'bold' }}>{t('header.menuItems.mainMenu')}</h2>
        </Link>
      </Menu.Item>

      <Menu.Item
        key="carsStore"
        style={{
          background: getBackground('/carsStore'),
          border: getBorder(HEADER_CARS_STORE),
        }}
        className="customHeader__menuItem"
      >
        <Link to="/carsStore">{t('header.menuItems.carsStore')}</Link>
      </Menu.Item>

      <Menu.Item
        key="myCars"
        style={{
          background: getBackground('/myCars'),
          border: getBorder(HEADER_MY_CARS),
        }}
        className="customHeader__menuItem"
      >
        <Link to="/myCars">{t('header.menuItems.myCars')}</Link>
      </Menu.Item>

      <Menu.Item
        key="auctionsHub"
        style={{
          background: getBackground('/auctionsHub'),
          border: getBorder(HEADER_AUCTIONS),
        }}
        className="customHeader__menuItem"
      >
        <Link to="/auctionsHub">{t('header.menuItems.auctions')}</Link>
      </Menu.Item>

      <Menu.Item
        key="messenger"
        style={{
          background: getBackground('/messenger'),
          border: getBorder(HEADER_MESSENGER),
        }}
        className="customHeader__menuItem"
      >
        <Link to="/messenger">{t('header.menuItems.messages')}</Link>
      </Menu.Item>
    </section>
  );
};
