import React, { useEffect, useState, useRef } from "react";
import { message } from "antd";
import "./auctionPage.css";
import "./customModal.css";
import { fetchAuctionCreator, playSwitchSound, playClosingSound, createNewAuctionUser } from "../../functions";
import { useLocation, useNavigate } from "react-router-dom";
import AuctionActionsModalRow from "../../components/AuctionActionsModalRow/AuctionActionsModalRow";
import { isMobile } from "react-device-detect";
import { supabase } from '../../supabase';
import * as api from '../../api/supabaseApi';
import { useTranslation } from "react-i18next";

const AuctionActionsModal = ({ visible, handleAuctionActionsCancel, selectedAuction, loadingBid, bid, buyCar, loadingBuy }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const modalRef = useRef(null);

  const totalRows = 3;
  const [focusedRow, setFocusedRow] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Function to find a user by nickname (used as fallback)
  const findUserByNickname = async (nickname) => {
    try {
      if (!nickname) return null;

      const users = await api.listUsers({ nickname }, 1, 0);
      return users && users.length > 0 ? users[0] : null;
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

  // Track the last key press time to prevent double processing
  const lastKeyPressTimeRef = useRef(0);

  // Reference to the modal container

  // Focus the modal when it becomes visible
  useEffect(() => {
    if (visible && modalRef.current) {
      modalRef.current.focus();
    }
  }, [visible]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      if (!visible) {
        setFocusedRow(0);
        return;
      }

      // Stop event propagation to prevent parent components from handling the same key events
      event.stopPropagation();

      // Prevent default browser behavior for these keys
      if (key === "ArrowUp" || key === "ArrowDown" || key === "Enter" || key === " ") {
        event.preventDefault();
      }

      // Get current time
      const now = Date.now();

      // Throttle key presses to prevent double processing
      // Only process if it's been more than 100ms since the last key press
      if ((key === "ArrowUp" || key === "ArrowDown") && now - lastKeyPressTimeRef.current < 100) {
        return;
      }

      // Update the last key press time
      lastKeyPressTimeRef.current = now;

      if (key === "ArrowUp") {
        playSwitchSound();
        // Calculate new index directly
        const newRow = focusedRow === 0 ? totalRows - 1 : focusedRow - 1;
        setFocusedRow(newRow);
      } else if (key === "ArrowDown") {
        playSwitchSound();
        // Calculate new index directly
        const newRow = focusedRow === totalRows - 1 ? 0 : focusedRow + 1;
        setFocusedRow(newRow);
      } else if (key === "Enter" || key === " ") {
        console.log("Enter key pressed in AuctionActionsModal, focused row:", focusedRow);

        switch (focusedRow) {
          case 0:
            if (selectedAuction?.status === "Active") {
              console.log("Triggering bid action");
              bid(selectedAuction);
            }
            break;
          case 1:
            if (selectedAuction?.status === "Active") {
              console.log("Triggering buy action");
              buyCar(selectedAuction);
            }
            break;
          case 2:
            console.log("Triggering profile action");
            const handleOpenProfile = async () => {
              try {
                if (!selectedAuction || !selectedAuction.id) {
                  console.log("No auction selected or auction has no ID");
                  message.info(t('auctionActionsModal.errors.noAuctionSelected'));
                  return;
                }

                setLoadingProfile(true);
                const user = await ensureAuctionUserExists(selectedAuction.id);

                if (!user) {
                  console.log("No user found for this auction");
                  message.info(t('auctionActionsModal.errors.profileNotAvailable'));
                  return;
                }
                localStorage.setItem('BUDDY_INFO', JSON.stringify(user));
                navigate(`/user/${user.id}`);
              } catch (error) {
                console.error("Error opening user profile:", error);
                message.error(t('auctionActionsModal.errors.couldNotOpenProfile'));
              } finally {
                setLoadingProfile(false);
              }
            };
            handleOpenProfile();
            break;
          default:
            break;
        }
      } else if (key === "Escape") {
        // Close the modal when Escape is pressed
        handleAuctionActionsCancel();
      }
    };

    // Use capture phase to ensure our handler runs before the parent's handler
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [visible, focusedRow, selectedAuction, bid, buyCar, navigate, totalRows, handleAuctionActionsCancel]);
  
  console.log("AuctionActionsModal rendering with visible:", visible);

  // If not visible, don't render anything
  if (!visible) {
    return null;
  }

  const handleClose = () => {
    playClosingSound();
    handleAuctionActionsCancel();
  };

  const handleOpenProfile = async () => {
    try {
      if (!selectedAuction || !selectedAuction.id) {
        console.log("No auction selected or auction has no ID");
        message.info(t('auctionActionsModal.errors.noAuctionSelected'));
        return;
      }

      setLoadingProfile(true);
      const user = await ensureAuctionUserExists(selectedAuction.id);

      if (!user) {
        console.log("No user found for this auction");
        message.info(t('auctionActionsModal.errors.profileNotAvailable'));
        return;
      }
      navigate(`/user/${user.id}`);
    } catch (error) {
      console.error("Error opening user profile:", error);
      message.error(t('auctionActionsModal.errors.couldNotOpenProfile'));
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="custom-modal-overlay" onClick={handleClose}>
      <div
        className="custom-modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        <div className="custom-modal-body">
          {selectedAuction?.status === "Active" && location.pathname !== "/myAuctions" && (
            <AuctionActionsModalRow
              text={loadingBid ? t('auctionActionsModal.loading') : t('auctionActionsModal.makeABid')}
              handler={() => bid(selectedAuction)}
              selected={focusedRow === 0}
            />
          )}

          {selectedAuction?.status === "Active" && location.pathname !== "/myAuctions" && (
            <AuctionActionsModalRow
              text={loadingBuy ? t('auctionActionsModal.loading') : t('auctionActionsModal.buyOut')}
              handler={() => buyCar(selectedAuction)}
              selected={focusedRow === 1}
            />
          )}

          <AuctionActionsModalRow
            text={loadingProfile ? t('auctionActionsModal.loading') : t('auctionActionsModal.openUserProfile')}
            handler={handleOpenProfile}
            selected={focusedRow === 2}
          />
        </div>
      </div>
    </div>
  );
};

export default AuctionActionsModal;
