import { Card, Row, Typography } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import icon from "../../../assets/icons/auctions.png"
import { isMobile } from 'react-device-detect'

export default function AuctionHubMyBids({ focused, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link to="/myBids" style={{ width: '100%', height: '100%' }}>
      <Row style={{ width: '100%', height: '100%' }}>
        <Card
          className={`cardZoom ${!isMobile && focused ? "activeCard" : "hubCard"}`}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseOver={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onClick}
        >
          <div className="cardContent" style={{ justifyContent: 'center', width: '100%', height: '100%' }}>
            <img src={icon} alt="icon" style={{ marginRight: '10px' }} />
            <Typography.Text className="auctionHub__cardText_black" style={{ textAlign: 'center' }}>
              My bids
            </Typography.Text>
          </div>
        </Card>
      </Row>
    </Link>
  )
}