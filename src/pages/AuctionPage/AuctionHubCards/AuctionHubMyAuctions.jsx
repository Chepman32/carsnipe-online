import { Card, Row, Typography } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import icon from "../../../assets/icons/myAuctions.png"

export default function AuctionHubMyAuctions({ focused }) {
    const [hovered, setHovered] = useState(false)
    
    return (
        <Link to="/myAuctions">
            <Row style={{ height: '25%' }}>
                <Card
                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className={focused ? "activeCard" : "hubCard"}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <div className="cardContent">
                        <Typography.Text className="auctionHub__cardText_black">
                            My auctions
              </Typography.Text>
              <img src={icon} alt="icon" />
                    </div>
                </Card>
            </Row>
        </Link>
    )
}