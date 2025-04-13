import React, { useState, useEffect } from 'react';
import { Card, Col, Flex, Typography } from 'antd';
import { getImageSource } from '../../functions';
import "./auctionPage.css"; // Ensure this file contains mobile-specific styles

export default function AuctionMobilePageItem({ auction, handleItemClick }) {
    const [imageSrc, setImageSrc] = useState('https://via.placeholder.com/300x200?text=Loading...');
    
    // Load image when auction changes
    useEffect(() => {
        if (auction && auction.make && auction.model) {
            const loadImage = async () => {
                try {
                    const src = await getImageSource(auction.make, auction.model);
                    setImageSrc(src);
                } catch (error) {
                    console.error('Error loading image:', error);
                    setImageSrc('https://via.placeholder.com/300x200?text=No+Image');
                }
            };
            loadImage();
        }
    }, [auction]);
    return (
        <Col className='mobileAuctionPageItem' span={24} onClick={() => handleItemClick(auction)} >
            <Flex direction="column" align="center" style={{ width: "100%", padding: "10px" }}>
                <img
                    src={imageSrc}
                    alt="Auction"
                    style={{ width: '100%', height: 'auto', objectFit: "contain", marginBottom: '10px' }}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                />
                <Typography.Text className='subText'>{auction.year} {auction.make} {auction.model}</Typography.Text>
                <Typography.Text className='price'>{auction.currentBid || auction.minBid}</Typography.Text>
                <Typography.Text className='subText'>Buy out: {auction.buy}</Typography.Text>
            </Flex>
        </Col>
    );
}
