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

  const listAuctions = useCallback(async (previousIndex = null) => {
    try {
      console.log("Fetching auctions...");
      const auctionData = await client.graphql({ query: listAuctionsQuery });
      console.log("Raw auction data:", auctionData);

      const auctions = auctionData.data.listAuctions.items.map((auction) => {
        const endTime = new Date(parseInt(auction.endTime) * 1000);
        const timeLeft = calculateTimeDifference(endTime);
        return { ...auction, endTime, timeLeft };
      });
      console.log("Processed auctions:", auctions);

      const filtered = auctions; // No filtering for now
      console.log("Filtered auctions:", filtered, "Player nickname:", playerInfo?.nickname);

      setAuctions(filtered);
      console.log("Auctions state set:", filtered);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    }
  }, [playerInfo?.nickname]);

  const increaseBid = async (auction) => {
    try {
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
        await buyItem();
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
  
      await client.graphql({
        query: mutations.updateUser,
        variables: { input: updatedUser },
      });
  
      const updatedAuction = {
        id: auction.id,
        currentBid: increasedBidValue,
        lastBidPlayer: playerInfo?.nickname,
        bidsCount: auction.bidsCount + 1,
        status: increasedBidValue < auction.buy ? "Active" : "Finished",
      };
  
      // Optimistic update
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
  
      if (auction.player !== playerInfo?.nickname) {
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
    } finally {
      setLoadingBid(false);
      setAuctionActionsVisible(false);
    }
  };
  
  const buyItem = async () => {
    try {
        if (money < selectedAuction.buy) {
            setCreditWarningModalvisible(true);
            return;
        } else if (money >= selectedAuction.buy) {
            setLoadingBuy(true);

            const userBiddedList = await fetchUserBiddedList(playerInfo.id);
            const userBidOnThisAuction = userBiddedList.find(bid => bid.auctionId === selectedAuction.id);

            const bidValue = userBidOnThisAuction ? userBidOnThisAuction.bidValue : 0;
            const moneyToSubtract = selectedAuction.buy - bidValue;

            const newMoney = money - moneyToSubtract;
            setMoney(newMoney);

            const auctionUser = await fetchAuctionUser(selectedAuction.id);
            
            const updatedSeller = {
              id: auctionUser.id,
              money: auctionUser.money + selectedAuction.buy,
              sold: [...(auctionUser.sold || []), selectedAuction.id],
            };

            await client.graphql({
              query: mutations.updateUser,
              variables: {
                input: updatedSeller,
              },
            });

            await client.graphql({
                query: mutations.createUserCar,
                variables: {
                    input: {
                        userId: playerInfo.id,
                        carId: selectedAuction.carId,
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
                id: selectedAuction.id,
                currentBid: selectedAuction.buy,
                lastBidPlayer: playerInfo?.nickname,
                status: "Finished",
            };
            await client.graphql({
                query: mutations.updateAuction,
                variables: { input: updatedAuctionInput },
            });

            message.success('Car successfully bought!');

            await checkAndUpdateAchievements();

            // Check if the user has acquired 5 cars and award "Starter Pack" achievement
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
        console.error(error);
    } finally {
        setLoadingBuy(false);
        setAuctionActionsVisible(false);
    }
};

  const handleAuctionActionsShow = () => {
    setAuctionActionsVisible(true);
  };

  const handleAuctionActionsCancel = () => {
    setAuctionActionsVisible(false);
  };

  useEffect(() => {
    console.log("useEffect triggered, calling listAuctions...");
    listAuctions();
  }, []); // Run only once on mount

  console.log("Rendering with auctions state:", auctions);

  const handleItemClick = (clickedAuction) => {
    setSelectedAuction(clickedAuction);
    playOpeningSound();
    isMobile === false ? handleAuctionActionsShow() : setSelectedAuctionDetailsModalVisible(true);
  };

  return (
    <div className="auctionPage">
      <div style={{ flex: 1 }}>
        <div className="auction-items-container" ref={auctionContainerRef}>
          {auctions.map((auction) =>
            !isMobile ? (
              <AuctionPageItem
                key={auction.id}
                setSelectedAuction={setSelectedAuction}
                auction={auction}
                index={auctions.indexOf(auction)}
                increaseBid={increaseBid}
                isSelected={auction === selectedAuction}
                handleAuctionActionsShow={handleAuctionActionsShow}
                handleItemClick={handleItemClick}
                playerInfo={playerInfo}
              />
            ) : (
              <AuctionMobilePageItem
                key={auction.id}
                setSelectedAuction={setSelectedAuction}
                auction={auction}
                index={auctions.indexOf(auction)}
                increaseBid={increaseBid}
                isSelected={auction === selectedAuction}
                handleAuctionActionsShow={handleAuctionActionsShow}
                handleItemClick={handleItemClick}
              />
            )
          )}
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