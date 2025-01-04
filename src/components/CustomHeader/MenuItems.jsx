import { Menu } from 'antd'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './styles.css';
import { useSelector } from 'react-redux';
import { FOCUS_ZONES, HEADER_AUCTIONS, HEADER_CARS_STORE, HEADER_MAIN_MENU, HEADER_MY_CARS } from '../../redux/slices/focusSlice';

export const MenuItems = () => {
    const location = useLocation()

    const { currentFocusedElement, focusedZone } = useSelector((state) => state.focus);
  return (
    <section className='customHeader__menu'>
      <Menu.Item 
    key="carsStore" 
    style={{
      background: location.pathname === "/" ? 'red' : "transparent",
      border: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_MAIN_MENU ? '2px solid red' : 'none', 
      borderRight: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_MAIN_MENU ? '2px solid red' : 'none' 
    }}
    className='customHeader__menuItem'
  >
        <Link to="/" >
          <h2 style={{ fontweight: 'bold' }}>
          Main Menu
          </h2>
        </Link>
  </Menu.Item>
  <Menu.Item 
    key="carsStore" 
    style={{ 
      background: location.pathname === "/carsStore" ? 'rgba(42, 72, 234, 0.57)' : "transparent",
      border: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_CARS_STORE ? '2px solid red' : 'none',
    }} 
    className='customHeader__menuItem'
  >
    <Link to="/carsStore">Cars Store</Link>
  </Menu.Item>
  
  <Menu.Item 
    key="myCars" 
    style={{ 
      background: location.pathname === "/myCars" ? 'rgba(42, 72, 234, 0.57)' : "transparent",
      border: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_MY_CARS ? '2px solid red' : 'none', 
    }} 
    className='customHeader__menuItem'
  >
    <Link to="/myCars">My Cars</Link>
  </Menu.Item>
  
  <Menu.Item 
    key="auctionsHub" 
    style={{ 
      background: location.pathname === "/auctionsHub" ? 'rgba(42, 72, 234, 0.57)' : "transparent",
      borderLeft: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_AUCTIONS ? '3px solid red' : 'none', 
      borderRight: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_AUCTIONS ? '3px solid red' : 'none'
    }} 
    className='customHeader__menuItem'
  >
    <Link to="/auctionsHub">Auctions</Link>
  </Menu.Item>
</section>
  )
}
