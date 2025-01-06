import { Menu } from 'antd';
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  FOCUS_ZONES,
  HEADER_MAIN_MENU,
  HEADER_CARS_STORE,
  HEADER_MY_CARS,
  HEADER_AUCTIONS,
  HEADER_LAST_OPTION,
  handleKeyDown as handleKeyDownAction,
} from '../../redux/slices/focusSlice';

export const MenuItems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentFocusedElement, focusedZone } = useSelector(
    (state) => state.focus
  );

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
        case HEADER_LAST_OPTION:
          navigate('/desiredPage'); // Replace with the actual path of the page you want to focus on
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
  }, [currentFocusedElement, focusedZone]);

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
        onFocus={(event) => event.preventDefault()}
        style={{
          background: getBackground('/'),
          border: getBorder(HEADER_MAIN_MENU),
          borderRight:
            focusedZone === FOCUS_ZONES.HEADER &&
            currentFocusedElement === HEADER_MAIN_MENU
              ? '2px solid red'
              : 'none',
        }}
        className='customHeader__menuItem'
      >
        <Link to="/">
          <h2 style={{ fontWeight: 'bold' }}>Main Menu</h2>
        </Link>
      </Menu.Item>

      <Menu.Item
        key="carsStore"
        onFocus={(event) => event.preventDefault()}
        style={{
          background: getBackground('/carsStore'),
          border: getBorder(HEADER_CARS_STORE),
        }}
        className='customHeader__menuItem'
      >
        <Link to="/carsStore">Cars Store</Link>
      </Menu.Item>

      <Menu.Item
        key="myCars"
        onFocus={(event) => event.preventDefault()}
        style={{
          background: getBackground('/myCars'),
          border: getBorder(HEADER_MY_CARS),
        }}
        className='customHeader__menuItem'
      >
        <Link to="/myCars">My Cars</Link>
      </Menu.Item>

      <Menu.Item
        key="auctionsHub"
        onFocus={(event) => event.preventDefault()}
        style={{
          background: getBackground('/auctionsHub'),
          border: getBorder(HEADER_AUCTIONS),
        }}
        className='customHeader__menuItem'
      >
        <Link to="/auctionsHub">Auctions</Link>
      </Menu.Item>
    </section>
  );
};