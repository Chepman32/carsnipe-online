import { Card, Row, Typography } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AuctionHubNotifications() {
    const [hovered, setHovered] = useState(false)
    
  return (
    <Row style={{ height: '10%' }}>
          <Card style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseOver={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`cardZoom auctionHub__card ${hovered ? "auctionHub__card_hovered" : ""}`}>
          <Typography.Text className=" auctionHub__cardText_black" style={{fontSize: "4vh"}}>
          Auction notifications
            </Typography.Text>
          </Card>
        </Row>
  )
}
