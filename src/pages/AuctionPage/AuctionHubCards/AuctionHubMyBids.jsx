import { Card, Row, Typography } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import icon from "../../../assets/icons/auctions.png"

export default function AuctionHubMyBids({ focused, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link to="/myBids">
      <Row style={{ height: '25%' }}>
        <Card
          className={`cardZoom ${focused ? "activeCard" : "hubCard"}`}
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
          <div className="cardContent">
            <img src={icon} alt="icon" />
            <Typography.Text className="auctionHub__cardText_black">
              My bids
            </Typography.Text>
          </div>
        </Card>
      </Row>
    </Link>
  )
}