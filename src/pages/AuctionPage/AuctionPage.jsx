import React, { useState, useEffect, useCallback, useRef } from "react";
import { Form, Select, message, notification, Button } from "antd";
import { supabase } from '../../supabase';
import {
  calculateTimeDifference,
  fetchUserBiddedList,
  fetchAuctionUser,
  fetchUserCarsRequest,
  playOpeningSound,
  playSwitchSound,
  playClosingSound,
  fetchUserAchievementsList,
  checkAndUpdateAchievements
} from "../../functions";
import { isMobile } from 'react-device-detect';
import AuctionPageItem from "./AuctionPageItem";
import { SelectedAuctionDetails } from "./SelectedAuctionDetails";
import AuctionActionsModal from "./AuctionActionsModal";
import AuctionMobilePageItem from "./MobileAuctionPageItem";
import { CreditWarningModal } from "../../components/CreditWarningModal/CreditWarningModal";
import { SelectedAuctionDetailsModal } from "./SelectedAuctionDetailsModal";
import { useDemoMode } from '../../contexts/DemoModeContext';
import { Row, Col, Typography } from 'antd';
import { useMediaQuery } from 'react-responsive';
const { Title } = Typography;

export default function AuctionPage({ playerInfo, setMoney, money }) {
  const [auctions, setAuctions] = useState([]);
  const [loadingBid, setLoadingBid] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [auctionActionsVisible, setAuctionActionsVisible] = useState(false);
  const [creditWarningModalvisible, setCreditWarningModalvisible] = useState(false);
  const [selectedAuctionDetailsModalVisible, setSelectedAuctionDetailsModalVisible] = useState(false);
  const auctionContainerRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef({});
  const { isDemoMode, demoUser } = useDemoMode();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const selectedAuctionRef = useRef(null);

  const listAuctions = useCallback(async () => {
    try {
      console.log("Fetching auctions...");
      if (isDemoMode) {
        // In demo mode, no auctions are available
        setAuctions([]);
      } else {
        const { data: auctionData, error } = await supabase
          .from('auctions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching auctions:", error);
          throw error;
        }

        console.log("Raw auction data:", auctionData);

        let auctions = auctionData.map((auction) => {
          const endTime = new Date(parseInt(auction.end_time) * 1000);
          const timeLeft = calculateTimeDifference(endTime);
          return { 
            ...auction, 
            endTime, 
            timeLeft,
            // Map snake_case to camelCase for compatibility
            endTime: auction.end_time,
            currentBid: auction.current_bid,
            lastBidPlayer: auction.last_bid_player,
            minBid: auction.min_bid,
            bidsCount: auction.bids_count,
            finishedAt: auction.finished_at
          };
        }).filter(a => a.id);

        // Filter out finished auctions that ended more than 5 minutes ago
        const currentTime = new Date();
        const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds
        auctions = auctions.filter(auction => {
          // Keep all active auctions
          if (auction.status !== 'Finished') return true;

          // For finished auctions, check if they ended less than 5 minutes ago
          const timeSinceEnd = currentTime - auction.endTime;
          return timeSinceEnd < fiveMinutesInMs;
        });

        // Sort auctions: active auctions by end date (ascending), finished auctions at the end
        auctions.sort((a, b) => {
          // If both have the same status, sort by end date
          if ((a.status === 'Finished') === (b.status === 'Finished')) {
            return a.endTime - b.endTime;
          }
          // Otherwise, put finished auctions at the end
          return a.status === 'Finished' ? 1 : -1;
        });

        console.log("Processed auctions:", auctions);

        setAuctions(auctions);
        console.log("Auctions state set:", auctions);

        // Only set initial selection if no auction is currently selected
        if (auctions.length > 0 && !selectedAuctionRef.current) {
          setSelectedAuction(auctions[0]);
          setFocusedIndex(0);
        }
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch auctions',
      });
    }
  }, [playerInfo, isDemoMode, selectedAuction]);

  const increaseBid = async (auction) => {
    try {
      if (!auction.id) {
        console.error("Invalid auction object:", auction);
        message.error('Cannot increase bid: Invalid auction data');
        return;
      }

      if (isDemoMode) {
        message.warning("Please sign in to bid on auctions. Demo mode is for viewing only.");
        return;
      } else {
        if (money < auction.buy) {
          setCreditWarningModalvisible(true);
          return;
        }
    
        setLoadingBid(true);
    
        const userBidded = await fetchUserBiddedList(playerInfo.id);
        if (userBidded.length === 0) {
          await checkAndUpdateAchievements(playerInfo);
        }
    
        let increasedBidValue;
        if (!auction.currentBid || auction.currentBid === auction.minBid) {
          increasedBidValue = auction.minBid;
        } else {
          increasedBidValue = Math.floor(auction.currentBid * 1.1);
        }
    
        console.log("Increasing bid from", auction.currentBid, "to", increasedBidValue);
    
        if (increasedBidValue >= auction.buy) {
          await buyItem(auction);
          return;
        }
    
        const newMoney = auction.lastBidPlayer === playerInfo?.nickname
          ? money - (increasedBidValue - auction.currentBid)
          : money - increasedBidValue;
    
        setMoney(newMoney);
    
        const bidObject = {
          auctionId: auction.id,
          bidValue: increasedBidValue,
          timestamp: new Date().toISOString(),
        };
    
        const updatedBiddedList = [...userBidded, bidObject];
        const bidInputs = updatedBiddedList.map(({ auctionId, bidValue, timestamp }) => ({ auctionId, bidValue, timestamp }));
    
        const updatedUser = {
          id: playerInfo.id,
          money: newMoney,
          bidded: bidInputs,
        };
    
        // Update user money
        const { error: userError } = await supabase
          .from('users')
          .update({ money: newMoney })
          .eq('id', playerInfo.id);

        if (userError) throw userError;

        // Add bid info record
        const { error: bidError } = await supabase
          .from('bid_info')
          .insert([{
            user_id: playerInfo.id,
            auction_id: auction.id,
            bid_value: increasedBidValue,
            timestamp: new Date().toISOString()
          }]);

        if (bidError) throw bidError;
    
        const updatedAuction = {
          current_bid: increasedBidValue,
          last_bid_player: playerInfo?.nickname,
          bids_count: auction.bidsCount + 1,
          status: increasedBidValue < auction.buy ? "Active" : "Finished",
          ...(increasedBidValue >= auction.buy && { finished_at: new Date().toISOString() })
        };
    
        setAuctions(prevAuctions =>
          prevAuctions.map(a =>
            a.id === auction.id ? { ...a, currentBid: increasedBidValue } : a
          )
        );
    
        const { data: response, error: auctionError } = await supabase
          .from('auctions')
          .update(updatedAuction)
          .eq('id', auction.id)
          .select()
          .single();
        console.log("Update Auction Response:", response);
    
        message.success('Bid successfully increased!');
    
        await listAuctions();
    
        // TODO: Update user participation statistics when GraphQL is implemented
        // if (playerInfo && auction.player !== playerInfo.nickname) {
        //   await client.graphql({
        //     query: mutations.updateUser,
        //     variables: {
        //       input: {
        //         id: playerInfo.id,
        //         totalAuctionsParticipated: (playerInfo.totalAuctionsParticipated || 0) + 1,
        //       }
        //     }
        //   });
        // }
      }
    } catch (error) {
      console.error("Error in increaseBid:", error);
      message.error('Failed to increase bid');
    } finally {
      setLoadingBid(false);
      setAuctionActionsVisible(false);
    }
  };
  
  const buyItem = async (auction = selectedAuction) => {
    console.log("buyItem called with auction:", auction);
    try {
      if (!auction.id) {
        console.error("Invalid auction for buyItem:", auction);
        message.error('Cannot buy item: No valid auction selected');
        return;
      }

      if (isDemoMode) {
        message.warning("Please sign in to purchase items. Demo mode is for viewing only.");
        return;
      } else {
        if (money < auction.buy) {
          setCreditWarningModalvisible(true);
          return;
        } else if (money >= auction.buy) {
          setLoadingBuy(true);

          const userBiddedList = await fetchUserBiddedList(playerInfo.id);
          const userBidOnThisAuction = userBiddedList.find(bid => bid.auctionId === auction.id);

          const bidValue = userBidOnThisAuction ? userBidOnThisAuction.bidValue : 0;
          const moneyToSubtract = auction.buy - bidValue;

          const newMoney = money - moneyToSubtract;
          setMoney(newMoney);

          const auctionUser = await fetchAuctionUser(auction.id);
          console.log("Buy item - Fetched auction user:", auctionUser);

          // Check if auctionUser exists and is not the default user
          if (auctionUser && auctionUser.id !== "default") {
            const updatedSeller = {
              id: auctionUser.id,
              money: auctionUser.money + auction.buy,
              sold: [...(auctionUser.sold || []), auction.id],
            };

            // Update seller's money and sold list
            const { error: sellerError } = await supabase
              .from('users')
              .update({ 
                money: auctionUser.money + auction.buy,
                sold: [...(auctionUser.sold || []), auction.id]
              })
              .eq('id', auctionUser.id);

            if (sellerError) console.error("Error updating seller:", sellerError);

            // Only try to delete the user car if we have a valid auctionUser
            try {
              const { error: deleteError } = await supabase
                .from('user_cars')
                .delete()
                .eq('user_id', auctionUser.id)
                .eq('car_id', auction.carId);

              if (deleteError) throw deleteError;
            } catch (error) {
              console.error("Error deleting user car:", error);
              // Continue with the purchase even if this fails
            }
          } else {
            console.log("No auction user found for auction ID:", auction.id);
          }

          // Create user car regardless of whether we found the seller
          const { error: createCarError } = await supabase
            .from('user_cars')
            .insert([{
              user_id: playerInfo.id,
              car_id: auction.carId
            }]);

          if (createCarError) throw createCarError;

          // Update buyer's money and total cars owned
          const { error: buyerError } = await supabase
            .from('users')
            .update({ 
              money: newMoney,
              total_cars_owned: supabase.raw('total_cars_owned + 1')
            })
            .eq('id', playerInfo.id);

          if (buyerError) throw buyerError;

          // Update auction to finished status
          const { error: auctionUpdateError } = await supabase
            .from('auctions')
            .update({
              current_bid: auction.buy,
              last_bid_player: playerInfo?.nickname,
              status: "Finished",
              finished_at: new Date().toISOString()
            })
            .eq('id', auction.id);

          if (auctionUpdateError) throw auctionUpdateError;

          message.success('Car successfully bought!');

          try {
            await checkAndUpdateAchievements(playerInfo.id);
          } catch (error) {
            console.error("Error checking achievements:", error);
            // Continue even if achievement check fails
          }

          await listAuctions();
        }
      }
    } catch (error) {
      console.error("Error in buyItem:", error);
      message.error('Failed to buy item');
    } finally {
      setLoadingBuy(false);
      setAuctionActionsVisible(false);
    }
  };

  const handleAuctionActionsShow = () => {
    console.log("handleAuctionActionsShow called, setting modal visible");
    setAuctionActionsVisible(true);
  };

  const handleAuctionActionsCancel = () => {
    console.log("handleAuctionActionsCancel called, setting modal hidden");
    playClosingSound();
    setAuctionActionsVisible(false);
  };

  const scrollToFocusedItem = useCallback((index) => {
    // Use a small timeout to ensure the DOM has updated
    setTimeout(() => {
      if (itemRefs.current[index] && itemRefs.current[index].current) {
        itemRefs.current[index].current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    }, 10);
  }, []);

  // Use a ref to track if we're currently processing a key event
  const isProcessingKeyRef = useRef(false);

  // Use a ref to track the current focused index to avoid closure issues
  const currentFocusedIndexRef = useRef(focusedIndex);

  // Update the ref when the state changes
  useEffect(() => {
    currentFocusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  const handleKeyDown = useCallback((event) => {
    // Don't handle keyboard events if there are no auctions
    if (!auctions.length) return;

    // Don't handle keyboard events if any modal is open
    if (auctionActionsVisible || selectedAuctionDetailsModalVisible || creditWarningModalvisible) {
      return;
    }

    // Don't process if we're already handling a key event
    if (isProcessingKeyRef.current) {
      return;
    }

    // Mark that we're processing a key event
    isProcessingKeyRef.current = true;

    try {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();

          // Calculate new index using the ref value
          const currentIndex = currentFocusedIndexRef.current;
          const upIndex = currentIndex === 0 ? auctions.length - 1 : currentIndex - 1;

          // Batch the state updates to happen together
          setTimeout(() => {
            setFocusedIndex(upIndex);
            setSelectedAuction(auctions[upIndex]);
            playSwitchSound();
            scrollToFocusedItem(upIndex);
          }, 0);
          break;

        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();

          // Calculate new index using the ref value
          const currentIdx = currentFocusedIndexRef.current;
          const downIndex = currentIdx === auctions.length - 1 ? 0 : currentIdx + 1;

          // Batch the state updates to happen together
          setTimeout(() => {
            setFocusedIndex(downIndex);
            setSelectedAuction(auctions[downIndex]);
            playSwitchSound();
            scrollToFocusedItem(downIndex);
          }, 0);
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          event.stopPropagation();
          console.log("Enter key pressed in AuctionPage, showing modal");

          if (selectedAuction) {
            playOpeningSound();

            // Use a more direct approach with a small delay
            setTimeout(() => {
              if (isMobile) {
                console.log("Setting mobile auction details modal visible");
                setSelectedAuctionDetailsModalVisible(true);
              } else {
                console.log("Setting auction actions modal visible via Enter key");
                // Force state update with a callback to ensure it happens
                setAuctionActionsVisible(true);

                // Log the state after setting it
                console.log("Modal should now be visible");
              }
            }, 10);
          }
          break;

        default:
          break;
      }
    } finally {
      // Reset the processing flag after a short delay
      setTimeout(() => {
        isProcessingKeyRef.current = false;
      }, 150); // Slightly longer than typical key repeat delay
    }
  }, [auctions, selectedAuction, auctionActionsVisible, selectedAuctionDetailsModalVisible, creditWarningModalvisible, scrollToFocusedItem]);

  useEffect(() => {
    console.log("useEffect triggered, calling listAuctions...");
    listAuctions();
  }, []); // Only run once on mount

  // Flag to track initial selection
  const hasInitializedRef = useRef(false);

  // Ensure selection persists after auctions are refreshed
  useEffect(() => {
    // Skip if we're processing a key event
    if (isProcessingKeyRef.current) {
      return;
    }

    // Only run this effect if auctions have loaded
    if (auctions.length === 0) {
      return;
    }

    // If we already have a selection, try to maintain it
    if (selectedAuction) {
      // Find the auction in the new list that matches the currently selected auction
      const matchingAuction = auctions.find(auction =>
        auction.id === selectedAuction.id
      );

      if (matchingAuction) {
        // Update the selected auction with the fresh data
        const newIndex = auctions.findIndex(auction => auction.id === matchingAuction.id);

        // Only update if the index has changed
        if (newIndex !== focusedIndex) {
          setFocusedIndex(newIndex);
          setSelectedAuction(matchingAuction);
        }
      } else {
        // If the previously selected auction is no longer in the list, select the first one
        setFocusedIndex(0);
        setSelectedAuction(auctions[0]);
      }
    } else if (!hasInitializedRef.current) {
      // If there's no selection but we have auctions, select the first one (only once)
      setFocusedIndex(0);
      setSelectedAuction(auctions[0]);
      hasInitializedRef.current = true;
    }
  }, [auctions, selectedAuction, focusedIndex]);

  // Reference to the auction page container
  const auctionPageRef = useRef(null);

  // Set up key event handling
  useEffect(() => {
    // Focus the auction page container when the component mounts
    if (auctionPageRef.current) {
      auctionPageRef.current.focus();
    }

    // Create a stable reference to the handler function
    const keyHandler = (e) => {
      // Only handle arrow keys, Enter, and Space to avoid conflicts
      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'Enter' ||
        e.key === ' '
      ) {
        handleKeyDown(e);
      }
    };

    // Use the capture phase with highest priority
    window.addEventListener('keydown', keyHandler, { capture: true, passive: false });

    return () => {
      window.removeEventListener('keydown', keyHandler, { capture: true, passive: false });
    };
  }, [handleKeyDown]);

  console.log("Rendering with auctions state:", auctions);

  const handleItemClick = (clickedAuction) => {
    console.log("handleItemClick called with auction:", clickedAuction);

    // Find the index of the clicked auction
    const newIndex = auctions.findIndex(auction => auction.id === clickedAuction.id);

    // Update the focused index and selected auction
    setFocusedIndex(newIndex);
    setSelectedAuction(clickedAuction);

    // Scroll to the selected item
    scrollToFocusedItem(newIndex);

    // Play sound and show appropriate modal
    playOpeningSound();

    // Use a small delay to ensure state updates have completed
    setTimeout(() => {
      if (isMobile) {
        console.log("Setting mobile details modal visible");
        setSelectedAuctionDetailsModalVisible(true);
      } else {
        console.log("Setting auction actions modal visible via click");
        setAuctionActionsVisible(true);
      }
    }, 10);
  };

  // --- Demo Mode Rendering ---
  if (isDemoMode) {
    return (
      <div
        className="auctionPage"
        tabIndex={0}
        ref={auctionPageRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '70vh',
          textAlign: 'center',
          padding: '2rem'
        }}
      >
        <div style={{ maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
            🏷️ Auctions Feature
          </h2>
          <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
            The auction feature allows you to buy and sell cars with other players. 
            Create auctions from your car collection and bid on others' listings.
          </p>
          <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#666' }}>
            Please sign in to access the full auction functionality, including viewing active auctions, 
            placing bids, and creating your own auctions.
          </p>
          <Button 
            type="primary" 
            size="large"
            onClick={() => {
              // Navigate to sign in or show sign in modal
              window.location.href = '/';
            }}
          >
            Sign In to Access Auctions
          </Button>
        </div>
      </div>
    );
  }
  // --- End Demo Mode Rendering ---

  return (
    <div
      className="auctionPage"
      tabIndex={0}
      ref={auctionPageRef}
      onFocus={() => console.log("Auction page focused")}
    >
      <div style={{ flex: 1 }}>
        <div className="auction-items-container" ref={auctionContainerRef}>
          {auctions.map((auction, index) => {
            itemRefs.current[index] = itemRefs.current[index] || React.createRef();
            return !isMobile ? (
              <div ref={itemRefs.current[index]} key={auction.id}>
                <AuctionPageItem
                  setSelectedAuction={setSelectedAuction}
                  auction={auction}
                  index={index}
                  increaseBid={increaseBid}
                  isSelected={auction === selectedAuction}
                  isFocused={index === focusedIndex}
                  handleAuctionActionsShow={handleAuctionActionsShow}
                  handleItemClick={handleItemClick}
                  playerInfo={playerInfo}
                />
              </div>
            ) : (
              <div ref={itemRefs.current[index]} key={auction.id}>
                <AuctionMobilePageItem
                  setSelectedAuction={setSelectedAuction}
                  auction={auction}
                  index={index}
                  increaseBid={increaseBid}
                  isSelected={auction === selectedAuction}
                  isFocused={index === focusedIndex}
                  handleAuctionActionsShow={handleAuctionActionsShow}
                  handleItemClick={handleItemClick}
                />
              </div>
            );
          })}
        </div>
      </div>
      {!isMobile && <SelectedAuctionDetails selectedAuction={selectedAuction} />}
      {/* Add a console log to verify the state when rendering */}
      {console.log("Rendering AuctionActionsModal with visible state:", auctionActionsVisible)}

      {/* Always render the modal but let it handle visibility internally */}
      <AuctionActionsModal
        visible={auctionActionsVisible}
        handleAuctionActionsCancel={() => setAuctionActionsVisible(false)}
        selectedAuction={selectedAuction}
        bid={increaseBid}
        loadingBid={loadingBid}
        buyCar={buyItem}
        loadingBuy={loadingBuy}
      />
      <CreditWarningModal
        isModalVisible={creditWarningModalvisible}
        setIsModalVisible={setCreditWarningModalvisible}
      />
      {isMobile === true && (
        <SelectedAuctionDetailsModal
          selectedAuction={selectedAuction}
          visible={selectedAuctionDetailsModalVisible}
          close={() => setSelectedAuctionDetailsModalVisible(false)}
          handleAuctionActionsShow={handleAuctionActionsShow}
        />
      )}
    </div>
  );
}
