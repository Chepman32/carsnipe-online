import { Card, Col, Typography } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackImage from '../../../assets/images/Forza-Horizon-5-Playlist-Cars.png';
import { isMobile } from 'react-device-detect';
import '../auctionPage.css';

export default function AuctionHubSearch({ focused }) {
  const [hovered, setHovered] = useState(false);
  const [initialScale, setInitialScale] = useState(true); // New state for initial scaling

  // Trigger initial scale on mount, then disable it after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialScale(false); // Stop initial scaling after 1-2 seconds
    }, 1500); // Adjust duration as needed
    return () => clearTimeout(timer);
  }, []);

  return (
    <Col xs={24} md={24} style={{ height: '100%' }} className={!isMobile && focused ? "activeCard" : "hubCard"}>
      <Link to="/auctions">
        <Card
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: "#fff",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              overflow: 'hidden' 
            }}
          >
            <img
              src={BackImage}
              alt="Auction Background"
              className="zoom-transition"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: (!isMobile && (initialScale || hovered || focused)) ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          </div>
          <Typography.Text className="auctionHub__cardText" style={{ position: 'relative', zIndex: 1 }}>
            Search auctions
          </Typography.Text>
        </Card>
      </Link>
    </Col>
  );
}