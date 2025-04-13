import React, { useEffect, useState } from "react";
import { Card, Space, Typography, Col, Flex } from "antd";
import { calculateTimeDifference, fetchAuctionUser, selectAvatar, getImageSource } from '../../functions';
import "./auctionPage.css"

export const SelectedAuctionDetails = ({ selectedAuction }) => {
  const [avatar, setAvatar] = React.useState(null);
  const [imageSrc, setImageSrc] = useState('https://via.placeholder.com/300x200?text=Loading...');

  useEffect(() => {
    const getAvatar = async () => {
      const auctionUser = await fetchAuctionUser(selectedAuction?.id);
      setAvatar(auctionUser?.avatar);
    }
    getAvatar();
  }, [selectedAuction]);
  
  // Load image when selectedAuction changes
  useEffect(() => {
    if (selectedAuction && selectedAuction.make && selectedAuction.model) {
      const loadImage = async () => {
        try {
          const src = await getImageSource(selectedAuction.make, selectedAuction.model);
          setImageSrc(src);
        } catch (error) {
          console.error('Error loading image:', error);
          setImageSrc('https://via.placeholder.com/300x200?text=No+Image');
        }
      };
      loadImage();
    }
  }, [selectedAuction]);
  return (
    <Col className="auctionDetails" span={12} style={{ height: '100%', padding: '20px' }}>
      {selectedAuction && (
        <Flex direction="column" style={{ height: "100%" }}>
          <Card
            title={<h3>{`${selectedAuction.make.toUpperCase()} ${selectedAuction.model}`} </h3>}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ overflow: 'hidden' }}>
              <img
                src={imageSrc}
                alt="Auction"
                className="auctionDetails_image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
            </div>
            <Flex direction="column" align="center" style={{ marginTop: '20px', minWidth: "100%", justifyContent: "space-between" }}>
              <div className="selectedAuction__avatar">
                <img src={selectAvatar(avatar)} alt="Avatar" />
                <Typography.Text className="subText">{selectedAuction?.lastBidPlayer}</Typography.Text>
              </div>
              <Space direction="vertical" style={{width: "50%"}}>
                <div style={{width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                  <Typography.Text className="subText">{`${selectedAuction?.currentBid ? "Highest" : "Start"} Bid:`}&nbsp;</Typography.Text>
                  <Typography.Text className="price bid">{selectedAuction?.currentBid || selectedAuction.minBid}</Typography.Text>
                </div>
                <Space>
                  <Typography.Text className="subText">Buy out:</Typography.Text>
                  <Typography.Text className="price buy">{selectedAuction.buy}</Typography.Text>
                </Space>
                <Typography.Text className="time">
                {calculateTimeDifference(selectedAuction.endTime)}
                </Typography.Text>
              </Space>
            </Flex>
          </Card>
        </Flex>
      )}
    </Col>
  );
};
