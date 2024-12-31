// MenuItems.js

import { Menu } from 'antd';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles.css';
import {
  HEADER_MAIN_MENU,
  HEADER_CARS_STORE,
  HEADER_MY_CARS,
  HEADER_AUCTIONS,
  HEADER_STORE,
  HEADER_PROFILE,
  FOCUS_ZONES
} from '../../shared/elementKeys';
import { useFocus } from '../../shared/FocusContext';

export const MenuItems = ({ selectedElement, handleElementSelect, handleKeyDown, activeElement }) => {
  const location = useLocation()

  const { focusedZone } = useFocus();
  
  const isActive = (key) => key === activeElement;

  return (
    <Menu 
      mode="horizontal" 
      selectedKeys={[activeElement]} 
      className='customHeader__menu'
      onKeyDown={handleKeyDown}
    >
      <Menu.Item 
        key={HEADER_MAIN_MENU} 
        className={`customHeader__menuItem ${isActive(HEADER_MAIN_MENU) && focusedZone === FOCUS_ZONES.HEADER ? 'active' : ''} ${selectedElement === HEADER_MAIN_MENU && !isActive(HEADER_MAIN_MENU) ? 'focused' : ''}`}
        onClick={() => handleElementSelect(HEADER_MAIN_MENU)}
      >
        <Link to="/">
          <h2 style={{ fontWeight: 'bold' }}>
            Main Menu
          </h2>
        </Link>
      </Menu.Item>
      
      <Menu.Item 
        key={HEADER_CARS_STORE} 
        className={`customHeader__menuItem ${isActive(HEADER_CARS_STORE) && focusedZone === FOCUS_ZONES.HEADER ? 'active' : ''} ${selectedElement === HEADER_CARS_STORE && !isActive(HEADER_CARS_STORE) ? 'focused' : ''}`}
        onClick={() => handleElementSelect(HEADER_CARS_STORE)}
      >
        <Link to="/carsStore">Cars Store</Link>
      </Menu.Item>
      
      <Menu.Item 
        key={HEADER_MY_CARS} 
        className={`customHeader__menuItem ${isActive(HEADER_MY_CARS) ? 'active' : ''} ${selectedElement === HEADER_MY_CARS && !isActive(HEADER_MY_CARS) ? 'focused' : ''}`}
        onClick={() => handleElementSelect(HEADER_MY_CARS)}
      >
        <Link to="/myCars">My Cars</Link>
      </Menu.Item>
      
      <Menu.Item 
        key={HEADER_AUCTIONS} 
        className={`customHeader__menuItem ${isActive(HEADER_AUCTIONS) ? 'active' : ''} ${selectedElement === HEADER_AUCTIONS && !isActive(HEADER_AUCTIONS) ? 'focused' : ''}`}
        onClick={() => handleElementSelect(HEADER_AUCTIONS)}
      >
        <Link to="/auctionsHub">Auctions</Link>
      </Menu.Item>
    </Menu>
  );
};