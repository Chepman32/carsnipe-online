import React, { useState, useEffect, useCallback, useRef } from "react";
import { Hub } from 'aws-amplify/utils';
import "@aws-amplify/ui-react/styles.css";
import { Form, Select, Typography, message } from "antd";
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import { getAuction as getAuctionQuery, getUser } from '../../graphql/queries';
import { fetchUserBiddedList, fetchAuctionUser, createNewUserCar, fetchUserAchievementsList, calculateTimeDifference } from "../../functions";
import AuctionPageItem from "./AuctionPageItem";
import { SelectedAuctionDetails } from "./SelectedAuctionDetails";
import AuctionActionsModal from "./AuctionActionsModal";
import { CreditWarningModal } from "../../components/CreditWarningModal/CreditWarningModal";
import { fetchUserCarsRequest, checkAndUpdateAchievements } from "../../functions";

const { Option } = Select;
const client = generateClient();

export default function MyBids({ playerInfo, setMoney, money }) {
  const [auctions, setAuctions] = useState([]);
  const [userCars, setUserCars] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [auctionDuration, setAuctionDuration] = useState(1);
  const [creditWarningModalvisible, setCreditWarningModalvisible] = useState(false);
  const [player, setPlayer] = useState("");
  const [loadingBid, setLoadingBid] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [form] = Form.useForm();
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [auctionActionsVisible, setAuctionActionsVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef({});

  const handleAuctionActionsShow = () => {
    setAuctionActionsVisible(true);
  };

  const handleAuctionActionsCancel = () => {
    setAuctionActionsVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const listAuctions = useCallback(async () => {
    try {
      // Fetch user's bidded list directly from User data
      const userData = await client.graphql({
        query: getUser,
        variables: { id: playerInfo.id }
      });
      
      const biddedList = userData.data.getUser.bidded || [];
      const auctionIds = biddedList.map(bid => bid.auctionId);

      if (!auctionIds.length) {
        setAuctions([]);
        return;
      }

      // Fetch all auctions the user has bid on
      const auctionPromises = auctionIds.map(async (id) => {
        try {
          const auctionData = await client.graphql({
            query: getAuctionQuery,
            variables: { id },
          });
          const auction = auctionData.data.getAuction;
          
          if (auction) {
            auction.endTime = new Date(parseInt(auction.endTime) * 1000);
            return auction;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching auction ${id}:`, error);
          return null;
        }
      });

      const auctionsData = await Promise.all(auctionPromises);
      let validAuctions = auctionsData.filter(auction => auction !== null);

      console.log("Before processing - validAuctions:", validAuctions);

      // Process auctions to ensure they have all required properties
      validAuctions = validAuctions.map(auction => {
        // Make sure endTime is a Date object
        if (auction.endTime && !(auction.endTime instanceof Date)) {
          auction.endTime = new Date(parseInt(auction.endTime) * 1000);
        }

        // Calculate timeLeft for display
        auction.timeLeft = calculateTimeDifference(auction.endTime);

        // Normalize status property (case insensitive comparison)
        if (auction.status) {
          // Convert to title case for consistency
          auction.status = auction.status.charAt(0).toUpperCase() + auction.status.slice(1).toLowerCase();
        } else {
          // If status is missing, set it based on other properties
          const now = new Date();
          if ((auction.currentBid && auction.buy && auction.currentBid >= auction.buy) ||
              (auction.endTime && auction.endTime < now)) {
            auction.status = 'Finished';
          } else {
            auction.status = 'Active';
          }
        }

        // For MyBids, we want to keep track of whether the user is the last bidder
        // This will be used to determine if we should show finished auctions
        auction.isUserLastBidder = auction.lastBidPlayer === playerInfo?.nickname;

        return auction;
      });

      // For MyBids, we show all auctions the user has bid on, but for finished auctions,
      // we only keep those where the user is the last bidder (potential winner)
      validAuctions = validAuctions.filter(auction => {
        // Keep all active auctions
        if (auction.status !== 'Finished') return true;

        // For finished auctions, keep if user is the last bidder
        return auction.isUserLastBidder;
      });

      try {
        // Sort auctions: active auctions by end date (ascending), finished auctions at the end
        validAuctions.sort((a, b) => {
          // First check if both auctions have valid endTime
          if (!a.endTime || !b.endTime) {
            return 0; // Keep original order if endTime is missing
          }

          // If both have the same status, sort by end date
          if ((a.status === 'Finished') === (b.status === 'Finished')) {
            return a.endTime - b.endTime;
          }
          // Otherwise, put finished auctions at the end
          return a.status === 'Finished' ? 1 : -1;
        });
      } catch (error) {
        console.error("Error sorting auctions:", error);
        // If sorting fails, at least we still have the unsorted auctions
      }

      console.log("After processing - validAuctions:", validAuctions);

      setAuctions(validAuctions);
      if (validAuctions.length > 0 && !selectedAuction) {
        setSelectedAuction(validAuctions[0]);
        setFocusedIndex(0);
      }
    } catch (error) {
      console.error("Error fetching user's bidded auctions:", error);
      setAuctions([]);
    }
  }, [playerInfo.id, selectedAuction]);

  const increaseBid = async (auction) => {
    try {
      setLoadingBid(true);
      const increasedBidValue = Math.floor(auction.currentBid * 1.1) || Math.round(auction.minBid * 1.1)
      setMoney(auction.lastBidPlayer === playerInfo?.nickname ? money - (increasedBidValue - auction.currentBid) : money - increasedBidValue)
      const updatedAuction = {
        id: auction.id,
        carName: auction.carName,
        player: auction.player,
        buy: auction.buy,
        minBid: auction.minBid,
        currentBid: increasedBidValue,
        endTime: auction.endTime,
        lastBidPlayer: playerInfo?.nickname,
        status: increasedBidValue < auction.buy ? "Active" : "Finished",
        ...(increasedBidValue >= auction.buy && { finishedAt: new Date().toISOString() }) // Add finishedAt when auction is finished
      };
      await client.graphql({
        query: mutations.updateAuction,
        variables: { input: updatedAuction },
      });
      await client.graphql({
        query: mutations.updateUser,
        variables: {
          input: {
            id: playerInfo.id,
            money: auction.lastBidPlayer === playerInfo.nickname ? money - (increasedBidValue - auction.currentBid) : money - increasedBidValue
          }
        },
      });
      handleCancel()
      message.success('Bid successfully increased!');

      listAuctions();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBid(false);
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
          finishedAt: new Date().toISOString() // Ensure correct format for Lambda detection
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

  const listener = async (data) => {
    const { nickname } = data?.payload?.data;
    setPlayer(nickname);
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
          scrollToFocusedItem(newIndex);
          return newIndex;
        });
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = prev === auctions.length - 1 ? 0 : prev + 1;
          setSelectedAuction(auctions[newIndex]);
          scrollToFocusedItem(newIndex);
          return newIndex;
        });
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (selectedAuction) {
          handleAuctionActionsShow();
        }
        break;
      default:
        break;
    }
  }, [auctions, selectedAuction]);

  useEffect(() => {
    listAuctions();
    Hub.listen('auth', listener);
  }, [listAuctions]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleItemClick = (clickedAuction) => {
    const newIndex = auctions.findIndex(auction => auction.id === clickedAuction.id);
    setFocusedIndex(newIndex);
    setSelectedAuction(clickedAuction);
    scrollToFocusedItem(newIndex);
    handleAuctionActionsShow();
  };

  const getAuctionInfoById = async (auctionId) => {
    try {
      const auctionData = await client.graphql({
        query: getAuctionQuery,
        variables: { id: auctionId },
      });
      return auctionData.data.getAuction;
    } catch (error) {
      console.error("Error fetching auction info:", error);
    }
  };

  const handleAuctionSelect = async (auctionId) => {
    const auctionInfo = await getAuctionInfoById(auctionId);
    console.log("Selected Auction Info:", auctionInfo);
  };

  console.log("Rendering MyBids with auctions:", auctions);

  return (
    <div style={{ display: 'flex', padding: '20px' }} tabIndex={0}>
      <div style={{ flex: 1 }}>
        <div className="auction-items-container">
          {auctions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Typography.Text>No auctions found. You haven't bid on any auctions yet.</Typography.Text>
            </div>
          ) : (
            auctions.map((auction, index) => {
              itemRefs.current[index] = itemRefs.current[index] || React.createRef();
              return (
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
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
      <SelectedAuctionDetails selectedAuction={selectedAuction} />
      <AuctionActionsModal
        visible={auctionActionsVisible}
        handleAuctionActionsCancel={handleAuctionActionsCancel}
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
    </div>
  );
}