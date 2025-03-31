import React, { useEffect, useState } from 'react';
import { calculateTimeDifference, fetchUserBiddedList } from '../../functions';
import { Card, Col, Flex, Space, Typography } from 'antd';
import "./auctionPage.css"
import ThinText from '../../components/Text/ThinText';

const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/cars/${imageName}`);
};

export default function AuctionPageItem({ playerInfo, auction, isSelected, index, handleItemClick }) {
    // Check if auction is finished or bought out
    const isFinished = auction.status === 'Finished' || auction.currentBid === auction.buy;

    // Text color style to apply when auction is finished
    const textStyle = isFinished ? { color: 'gray' } : {};

    // Safe click handler that checks if playerInfo exists
    const handleClick = () => {
        if (handleItemClick) {
            handleItemClick(auction);
            console.log("auction info:", auction);
        }
    };

    return (
        <Col className='auctionPageItem' span={24} style={{ height: '5%', width: '100%', display: 'flex' }} onClick={handleClick} >
            <Flex justify="space-between" align="flex-end" style={{width: "100%", paddingRight: "1vw", outline: isSelected ? '3px solid #ff69b4' : 'none'}} >
                <div>
                    <img
                        src={getImageSource(auction.make, auction.model)}
                        alt="Auction"
                        style={{ width: 'auto', height: '10vw', objectFit: "contain", marginRight: '10px' }}
                    />
                    <div style={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                        <ThinText style={textStyle}>{auction.year}&nbsp;{auction.make}&nbsp;{auction.model} </ThinText>
                        <Flex align="center">
                            <img src='https://static.thenounproject.com/png/1336726-200.png' className='hammer' alt=''/>
                            <Typography.Text className='subText' style={textStyle}>
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
                        <Typography.Text className='subText' style={textStyle}>
                            {auction.currentBid >= auction.minBid ? 'HIGHEST' : 'START'} BID
                        </Typography.Text>
                        <Typography.Text className='price' style={textStyle}>
                            {auction.currentBid || auction.minBid}
                        </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', flexDirection: "column", alignItems: "flex-end", marginLeft: "3rem" }}>
                        <Typography.Text className='subText' style={textStyle}>Buy out</Typography.Text>
                        <Typography.Text className='price' style={textStyle}>{auction.buy}</Typography.Text>
                    </div>
                </Flex>
            </Flex>
        </Col>
    );
}
