import { Card, Row, Typography } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import icon from "../../../assets/icons/myAuctions.png"
import { isMobile } from 'react-device-detect'

export default function AuctionHubMyAuctions({ focused }) {
    const [hovered, setHovered] = useState(false)
    
    return (
        <Link to="/myAuctions" style={{ width: '100%', height: '100%' }}>
            <Row style={{ width: '100%', height: '100%' }}>
                <Card
                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className={!isMobile && focused ? "activeCard" : "hubCard"}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <div className="cardContent" style={{ justifyContent: 'center', width: '100%', height: '100%' }}>
                        <Typography.Text className="auctionHub__cardText_black" style={{ textAlign: 'center', marginRight: '10px' }}>
                            My auctions
                        </Typography.Text>
                        <img src={icon} alt="icon" />
                    </div>
                </Card>
            </Row>
        </Link>
    )
}