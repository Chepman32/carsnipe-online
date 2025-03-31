import React, { useEffect, useState } from "react";
import { Modal, Spin, message } from "antd";
import "./auctionPage.css";
import { fetchAuctionCreator, playSwitchSound, createNewAuctionUser } from "../../functions";
import { useNavigate } from "react-router-dom";
import AuctionActionsModalRow from "../../components/AuctionActionsModalRow/AuctionActionsModalRow";
import { isMobile } from "react-device-detect";
import { generateClient } from 'aws-amplify/api';
import * as queries from '../../graphql/queries';

const client = generateClient();

const AuctionActionsModal = ({ visible, handleAuctionActionsCancel, selectedAuction, loadingBid, bid, buyCar, loadingBuy }) => {
  const navigate = useNavigate();

  const totalRows = 3;
  const [focusedRow, setFocusedRow] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Function to find a user by nickname (used as fallback)
  const findUserByNickname = async (nickname) => {
    try {
      if (!nickname) return null;

      const userData = await client.graphql({
        query: queries.listUsers,
        variables: {
          filter: {
            nickname: { eq: nickname }
          }
        }
      });

      const users = userData?.data?.listUsers?.items || [];
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Error finding user by nickname:", error);
      return null;
    }
  };

  // Function to ensure auction-user association exists
  const ensureAuctionUserExists = async (auctionId) => {
    try {
      if (!auctionId || !selectedAuction) return null;

      // First try to get the user through the normal method
      let user = await fetchAuctionCreator(auctionId);

      // If that fails, try to find the user by the auction's player field
      if (!user && selectedAuction.player) {
        user = await findUserByNickname(selectedAuction.player);

        // If we found a user, create the missing auction-user association
        if (user) {
          console.log("Creating missing auction-user association for:", user.id, auctionId);
          await createNewAuctionUser(user.id, auctionId);
        }
      }

      return user;
    } catch (error) {
      console.error("Error ensuring auction-user exists:", error);
      return null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
  
      if (visible) {
        if (key === "ArrowUp") {
          playSwitchSound();
          setFocusedRow((prevRow) => (prevRow === 0 ? totalRows - 1 : prevRow - 1));
        } else if (key === "ArrowDown") {
          playSwitchSound();
          setFocusedRow((prevRow) => (prevRow === totalRows - 1 ? 0 : prevRow + 1));
        } else if (key === "Enter") {
          switch (focusedRow) {
            case 0:
              bid(selectedAuction);
              break;
            case 1:
              buyCar(selectedAuction);
              break;
            case 2:
              const handleOpenProfile = async () => {
                try {
                  if (!selectedAuction || !selectedAuction.id) {
                    console.log("No auction selected or auction has no ID");
                    message.info("Cannot open user profile: No auction selected");
                    return;
                  }

                  setLoadingProfile(true);
                  const user = await ensureAuctionUserExists(selectedAuction.id);

                  if (!user) {
                    console.log("No user found for this auction");
                    message.info("User profile not available for this auction");
                    return;
                  }
                  navigate(`/user/${user.id}`);
                } catch (error) {
                  console.error("Error opening user profile:", error);
                  message.error("Could not open user profile");
                } finally {
                  setLoadingProfile(false);
                }
              };
              handleOpenProfile();
              break;
            default:
              break;
          }
        }
      } else {
        setFocusedRow(0);
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
  
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, focusedRow, selectedAuction, bid, buyCar, navigate, totalRows]);
  
  return (
    <Modal
      centered
      className="carDetailsModal"
      width={isMobile ? "90%" : "50%"}
      visible={visible}
      title="Car Details"
      onCancel={handleAuctionActionsCancel}
      footer={null}
    >
      {
        selectedAuction?.status === "Active" && <AuctionActionsModalRow text={loadingBid ? <Spin /> : "Make a bid"} handler={() => bid(selectedAuction)} selected={focusedRow === 0} />
      }
      {
        selectedAuction?.status === "Active" && <AuctionActionsModalRow text={loadingBuy ? <Spin /> : "Buy out"} handler={() => buyCar(selectedAuction)} selected={focusedRow === 1} />
      }
      <AuctionActionsModalRow
        text={loadingProfile ? <Spin size="small" /> : "Open user's profile"}
        handler={async () => {
          try {
            if (!selectedAuction || !selectedAuction.id) {
              console.log("No auction selected or auction has no ID");
              message.info("Cannot open user profile: No auction selected");
              return;
            }

            setLoadingProfile(true);
            const user = await ensureAuctionUserExists(selectedAuction.id);

            if (!user) {
              console.log("No user found for this auction");
              message.info("User profile not available for this auction");
              return;
            }
            navigate(`/user/${user.id}`);
          } catch (error) {
            console.error("Error opening user profile:", error);
            message.error("Could not open user profile");
          } finally {
            setLoadingProfile(false);
          }
        }}
        selected={focusedRow === 2}
      />
    </Modal>
  );
};

export default AuctionActionsModal;
