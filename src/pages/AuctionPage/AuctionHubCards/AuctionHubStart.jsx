import { Card, Row, Typography } from 'antd'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'

export default function AuctionHubStart({ focused, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link to="/myCars" style={{ width: '100%', height: '100%' }}>
      <Row style={{ width: '100%', height: '100%' }}>
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
          className={!isMobile && focused ? "activeCard" : "hubCard"}
        >
          <div className="cardContent" style={{ justifyContent: 'center', width: '100%', height: '100%' }}>
            <Typography.Text className="auctionHub__cardText" style={{ textAlign: 'center' }}>
              Start auction
            </Typography.Text>
          </div>
        </Card>
      </Row>
    </Link>
  )
}