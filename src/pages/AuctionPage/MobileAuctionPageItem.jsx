import React, { useState, useEffect } from 'react';
import { calculateTimeDifference, getImageSource } from '../../functions';
import { Col, Flex, Typography } from 'antd';
import "./auctionPage.css"
import ThinText from '../../components/Text/ThinText';

export default function AuctionMobilePageItem({ auction, isSelected, isFocused, index, handleItemClick }) {
    const [imageSrc, setImageSrc] = useState('https://via.placeholder.com/300x200?text=Loading...');
    
    // Handle click
    const handleClick = () => {
        if (handleItemClick) {
            handleItemClick(auction);
        }
    };

    // Determine if this item should be shown as selected - only use the props from parent
    const isItemSelected = isSelected || isFocused;

    // Base styles that don't change with selection
    const baseStyle = {
        width: "100%",
        paddingRight: "1vw",
        transition: 'all 0.3s ease-in-out' // Smooth transition for all changes
    };
    
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
        <Col
            className={`mobileAuctionPageItem ${isItemSelected ? 'selected-auction' : ''}`}
            span={24}
            style={{ height: '5%', width: '100%', display: 'flex' }}
            onClick={handleClick}
        >
            <Flex justify="space-between" align="flex-end" style={baseStyle} >
                <div style={{display: "flex", alignItems: "center"}}>
                <img
                        src={imageSrc}
                        alt="Auction"
                        className="mobileAuctionPageItem__image"
                        style={{ width: 'auto', height: '25vw', objectFit: "contain", marginRight: '10px' }}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                    />
                    <div style={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                    <ThinText>{auction.year}&nbsp;{auction.make}&nbsp;{auction.model} </ThinText>
                        <Flex align="center">
                            <img src='https://static.thenounproject.com/png/1336726-200.png' className='hammer' alt=''/>
                            <Typography.Text className='subText'>
                                {auction.status === 'Finished'
                                  ? 'Finished'
                                  : auction.currentBid === auction.buy
                                    ? 'Finished'
                                    : calculateTimeDifference(auction.endTime)}
                            </Typography.Text>
                        </Flex>
                </div>
                </div>
                <Flex>
                <div style={{ display: 'flex', flexDirection: "column", alignItems: "flex-end" }}>
                            <p className='subText'>
                                {auction.currentBid > auction.minBid ? 'HIGHEST' : 'START'} BID
                            </p>
                            <Typography.Text className='price' >
                                {auction.currentBid || auction.minBid}
                            </Typography.Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: "column", alignItems: "flex-end", marginLeft: "3rem" }}>
                            <p className='subText'>Buy out</p>
                            <Typography.Text className='price'>{auction.buy}</Typography.Text>
                        </div>
                </Flex>
                </Flex>
        </Col>
    );
}
