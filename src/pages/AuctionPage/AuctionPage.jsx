import React, { useState, useEffect, useCallback, useRef } from "react";
import "@aws-amplify/ui-react/styles.css";
import { Form, Select, message } from "antd";
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import { listAuctions as listAuctionsQuery } from '../../graphql/queries';
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

const client = generateClient();

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

  const listAuctions = useCallback(async (previousIndex = null) => {
    try {
      console.log("Fetching auctions...");
      const auctionData = await client.graphql({ query: listAuctionsQuery });
      console.log("Raw auction data:", auctionData);

      const auctions = auctionData.data.listAuctions.items.map((auction) => {
        const endTime = new Date(parseInt(auction.endTime) * 1000);
        const timeLeft = calculateTimeDifference(endTime);
        return { ...auction, endTime, timeLeft };
      }).filter(a => a.id);
      console.log("Processed auctions:", auctions);

      setAuctions(auctions);
      console.log("Auctions state set:", auctions);

      if (auctions.length > 0 && !selectedAuction) {
        setSelectedAuction(auctions[0]);
        setFocusedIndex(0);
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
    }
  }, [playerInfo, selectedAuction]);

  const increaseBid = async (auction) => {
    try {
      if (!auction.id) {
        console.error("Invalid auction object:", auction);
        message.error('Cannot increase bid: Invalid auction data');
        return;
      }

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
  
      const newMoney = auction.lastBidPlayer === playerInfo.nickname
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
  
      await client.graphql({
        query: mutations.updateUser,
        variables: { input: updatedUser },
      });
  
      const updatedAuction = {
        id: auction.id,
        currentBid: increasedBidValue,
        lastBidPlayer: playerInfo.nickname,
        bidsCount: auction.bidsCount + 1,
        status: increasedBidValue < auction.buy ? "Active" : "Finished",
      };
  
      setAuctions(prevAuctions =>
        prevAuctions.map(a =>
          a.id === auction.id ? { ...a, currentBid: increasedBidValue } : a
        )
      );
  
      const response = await client.graphql({
        query: mutations.updateAuction,
        variables: { input: updatedAuction },
      });
      console.log("Update Auction Response:", response);
  
      message.success('Bid successfully increased!');
  
      const currentIndex = auctions.findIndex(a => a.id === auction.id);
      await listAuctions(currentIndex);
  
      if (auction.player !== playerInfo.nickname) {
        await client.graphql({
          query: mutations.updateUser,
          variables: {
            input: {
              id: playerInfo.id,
              totalAuctionsParticipated: (playerInfo.totalAuctionsParticipated || 0) + 1,
            }
          }
        });
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

        // Check if auctionUser exists before accessing its properties
        if (auctionUser) {
          const updatedSeller = {
            id: auctionUser.id,
            money: auctionUser.money + auction.buy,
            sold: [...(auctionUser.sold || []), auction.id],
          };

          await client.graphql({
            query: mutations.updateUser,
            variables: { input: updatedSeller },
          });

          // Only try to delete the user car if we have a valid auctionUser
          try {
            await client.graphql({
              query: mutations.deleteUserCar,
              variables: {
                input: {
                  userId: auctionUser.id,
                  carId: auction.carId,
                },
              },
            });
          } catch (error) {
            console.error("Error deleting user car:", error);
            // Continue with the purchase even if this fails
          }
        } else {
          console.log("No auction user found for auction ID:", auction.id);
        }

        // Create user car regardless of whether we found the seller
        await client.graphql({
          query: mutations.createUserCar,
          variables: {
            input: {
              userId: playerInfo.id,
              carId: auction.carId,
            },
          },
        });

        await client.graphql({
          query: mutations.updateUser,
          variables: {
            input: {
              id: playerInfo.id,
              money: newMoney,
            },
          },
        });

        const updatedAuctionInput = {
          id: auction.id,
          currentBid: auction.buy,
          lastBidPlayer: playerInfo.nickname,
          status: "Finished",
        };
        await client.graphql({
          query: mutations.updateAuction,
          variables: { input: updatedAuctionInput },
        });

        message.success('Car successfully bought!');

        try {
          await checkAndUpdateAchievements(playerInfo);
        } catch (error) {
          console.error("Error checking achievements:", error);
          // Continue even if achievement check fails
        }

        const userCars = await fetchUserCarsRequest(playerInfo.id);
        const userAchievements = await fetchUserAchievementsList(playerInfo.id);

        if (userCars.length >= 3 && !userAchievements.some(achievement => achievement.name === "Starter Pack")) {
          const newAchievement = { name: "Starter Pack", date: new Date().toISOString() };
          const updatedAchievements = [...userAchievements, newAchievement];

          await client.graphql({
            query: mutations.updateUser,
            variables: {
              input: {
                id: playerInfo.id,
                achievements: updatedAchievements.map(achievement => ({
                  name: achievement.name,
                  date: achievement.date
                })),
              },
            },
          });

          message.success("Achievement unlocked: Starter Pack");
        }

        if (!userAchievements.some(achievement => achievement.name === "First Win")) {
          const newAchievement = { name: "First Win", date: new Date().toISOString() };
          const updatedAchievements = [...userAchievements, newAchievement];

          await client.graphql({
            query: mutations.updateUser,
            variables: {
              input: {
                id: playerInfo.id,
                achievements: updatedAchievements.map(achievement => ({
                  name: achievement.name,
                  date: achievement.date
                })),
              },
            },
          });

          message.success("Achievement unlocked: First Win");
        }

        await listAuctions();
      }
    } catch (error) {
      console.error("Buy item error:", error);
      message.error('Failed to buy item');
    } finally {
      setLoadingBuy(false);
      setAuctionActionsVisible(false);
    }
  };

  const handleAuctionActionsShow = () => {
    setAuctionActionsVisible(true);
  };

  const handleAuctionActionsCancel = () => {
    playClosingSound();
    setAuctionActionsVisible(false);
  };

  const scrollToFocusedItem = (index) => {
    if (itemRefs.current[index] && itemRefs.current[index].current) {
      itemRefs.current[index].current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  };

  const handleKeyDown = useCallback((event) => {
    if (!auctions.length) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = prev === 0 ? auctions.length - 1 : prev - 1;
          setSelectedAuction(auctions[newIndex]);
          playSwitchSound();
          scrollToFocusedItem(newIndex);
          return newIndex;
        });
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = prev === auctions.length - 1 ? 0 : prev + 1;
          setSelectedAuction(auctions[newIndex]);
          playSwitchSound();
          scrollToFocusedItem(newIndex);
          return newIndex;
        });
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (selectedAuction) {
          playOpeningSound();
          isMobile ? setSelectedAuctionDetailsModalVisible(true) : handleAuctionActionsShow();
        }
        break;
      default:
        break;
    }
  }, [auctions, selectedAuction]);

  useEffect(() => {
    console.log("useEffect triggered, calling listAuctions...");
    listAuctions();
  }, [listAuctions]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  console.log("Rendering with auctions state:", auctions);

  const handleItemClick = (clickedAuction) => {
    const newIndex = auctions.findIndex(auction => auction.id === clickedAuction.id);
    setFocusedIndex(newIndex);
    setSelectedAuction(clickedAuction);
    scrollToFocusedItem(newIndex);
    playOpeningSound();
    isMobile === false ? handleAuctionActionsShow() : setSelectedAuctionDetailsModalVisible(true);
  };

  return (
    <div className="auctionPage" tabIndex={0}>
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
      <AuctionActionsModal
        visible={auctionActionsVisible}
        handleAuctionActionsCancel={() => {
          playClosingSound();
          handleAuctionActionsCancel();
        }}
        selectedAuction={selectedAuction}
        bid={increaseBid}
        loadingBid={loadingBid}
        buyCar={() => buyItem(selectedAuction)}
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
