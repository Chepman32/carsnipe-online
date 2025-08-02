import React, { useEffect, useState, useRef } from "react";
import { Card, Col, Flex, Modal, Space, Spin, Typography } from "antd";
import "./auctionPage.css";
import { calculateTimeDifference, fetchAuctionCreator, fetchAuctionUser, playSwitchSound, selectAvatar } from "../../functions";
import { useNavigate } from "react-router-dom";
import AuctionActionsModalRow from "../../components/AuctionActionsModalRow/AuctionActionsModalRow";
import { isMobile } from "react-device-detect";
import { SelectedAuctionDetails } from "./SelectedAuctionDetails";
import { getCarImageUrl } from '../../config/assets';

const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return getCarImageUrl(imageName.replace('.png', ''));
  };

export const SelectedAuctionDetailsModal = ({ visible, close, selectedAuction, handleAuctionActionsShow }) => {
    const [avatar, setAvatar] = React.useState(null);

  useEffect(() => {
    const getAvatar = async () => {
      if (!selectedAuction?.id) {
        setAvatar("avatar1");
        return;
      }
      
      try {
        const auctionUser = await fetchAuctionUser(selectedAuction.id);
        console.log("Modal - Fetched auction user:", auctionUser);
        setAvatar(auctionUser.avatar || "avatar1");
      } catch (error) {
        console.error("Error fetching avatar in modal:", error);
        setAvatar("avatar1");
      }
    }
    getAvatar()
  }, [selectedAuction]);

  // Reference to the modal container
  const modalRef = useRef(null);

  // Focus the modal when it becomes visible
  useEffect(() => {
    if (visible && modalRef.current) {
      modalRef.current.focus();
    }
  }, [visible]);

  // Handle keyboard events for the modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!visible) return;

      // Stop event propagation to prevent parent components from handling the same key events
      event.stopPropagation();

      // Prevent default browser behavior for these keys
      if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
        event.preventDefault();
      }

      // Handle specific keys
      if (event.key === "Enter" || event.key === " ") {
        handleAuctionActionsShow();
      } else if (event.key === "Escape") {
        close();
      }
    };

    // Use capture phase to ensure our handler runs before the parent's handler
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [visible, close, handleAuctionActionsShow]);
  
  return (
    <Modal
      centered
      className="selectedAuctionDetailsModal"
      width={"90%"}
      open={visible}
      onCancel={close}
      footer={null}
      modalRender={(modal) => (
        <div ref={modalRef} tabIndex={-1} style={{ outline: 'none' }}>
          {modal}
        </div>
      )}
    >
      <div className="auctionDetails" style={{ height: '100%', padding: '20px' }}>
      {selectedAuction && (
        <Flex direction="column" style={{ height: "100%" }}>
          <Card
            title={<h3>{`${selectedAuction.make.toUpperCase()} ${selectedAuction.model}`} </h3>}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ overflow: 'hidden' }}>
              <img
                src={getImageSource(selectedAuction.make, selectedAuction.model)}
                alt="Auction"
                className="auctionDetails_image"
              />
            </div>
            <Flex direction="column" align="center" style={{ marginTop: '20px', minWidth: "100%", justifyContent: "space-between" }}>
              <div className="selectedAuction__avatar">
                <img src={selectAvatar(avatar)} alt="Avatar" />
                <Typography.Text className="subText">{selectedAuction?.lastBidPlayer}</Typography.Text>
              </div>
              <Space direction="vertical" style={{width: "100%"}}>
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
                                  <div className="selectedAuctionDetailsModal__actions" onClick={handleAuctionActionsShow}>
                                  <h3 style={{textAlign: "right"}}>Purchase ...</h3>
                                  </div>
              </Space>
            </Flex>
          </Card>
        </Flex>
      )}
    </div>
    </Modal>
  );
};
