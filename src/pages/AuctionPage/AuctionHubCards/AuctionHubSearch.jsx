import { Card, Col, Typography } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BackImage from '../../../assets/images/Forza-Horizon-5-Playlist-Cars.png';
import { isMobile } from 'react-device-detect';
import '../auctionPage.css';

export default function AuctionHubSearch({ focused }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Col
      style={{ height: '100%', width: isMobile ? '100%' : '50%' }}
      className={focused ? "activeCard" : "hubCard"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
                transform: hovered || focused ? 'scale(1.05)' : 'scale(1)',
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