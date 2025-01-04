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
    key="mainMenu" 
    style={{ 
      background: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_MAIN_MENU ? 'red' : "transparent",
      borderLeft: location.pathname === "/carsStore" ? '1px solid red' : 'none', 
      borderRight: location.pathname === "/carsStore" ? '1px solid red' : 'none' 
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
      background: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_CARS_STORE ? 'red' : "transparent",
      borderLeft: location.pathname === "/carsStore" ? '1px solid red' : 'none', 
      borderRight: location.pathname === "/carsStore" ? '1px solid red' : 'none' 
    }} 
    className='customHeader__menuItem'
  >
    <Link to="/carsStore">Cars Store</Link>
  </Menu.Item>
  
  <Menu.Item 
    key="myCars" 
    style={{ 
      background: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_MY_CARS ? 'red' : "transparent",
      borderLeft: location.pathname === "/myCars" ? '1px solid red' : 'none', 
      borderRight: location.pathname === "/myCars" ? '1px solid red' : 'none' 
    }} 
    className='customHeader__menuItem'
  >
    <Link to="/myCars">My Cars</Link>
  </Menu.Item>
  
  <Menu.Item 
    key="auctionsHub" 
    style={{ 
      background: focusedZone === FOCUS_ZONES.HEADER && currentFocusedElement === HEADER_AUCTIONS ? 'red' : "transparent",
      borderLeft: (location.pathname === "/auctionsHub" || location.pathname === "/auctions" || location.pathname === "/myBids" || location.pathname === "/myAuctions") ? '1px solid red' : 'none',
      borderRight: (location.pathname === "/auctionsHub" || location.pathname === "/auctions" || location.pathname === "/myBids" || location.pathname === "/myAuctions") ? '1px solid red' : 'none' 
    }} 
    className='customHeader__menuItem'
  >
    <Link to="/auctionsHub">Auctions</Link>
  </Menu.Item>
</section>
  )
}
