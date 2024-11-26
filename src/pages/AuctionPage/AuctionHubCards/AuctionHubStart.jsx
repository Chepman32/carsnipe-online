import { Card, Row, Typography } from 'antd'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'

export default function AuctionHubStart({ focused, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link to="/myCars" style={{ width: isMobile ? '100%' : '50%', height: '50%' }}>
      <Row style={{ width: '100%', height: '50%' }}>
        <Card
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: "#2d24b3",
            color: "#fff",
          }}
          onMouseOver={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onClick}
          className={focused ? "activeCard" : "hubCard"}
        >
          <div className="cardContent">
            <Typography.Text className="auctionHub__cardText">
              Start auction
            </Typography.Text>
          </div>
        </Card>
      </Row>
    </Link>
  )
}