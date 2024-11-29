import { Menu } from 'antd'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './styles.css';

export const MenuItems = () => {
    const location = useLocation()
  return (
    <section className='customHeader__menu'>
      <Menu.Item 
    key="carsStore" 
    style={{ 
      background: 'transparent', 
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
      background: 'transparent', 
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
      background: 'transparent', 
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
      background: 'transparent', 
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
