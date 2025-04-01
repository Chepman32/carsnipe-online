import React, { useState, useEffect, useCallback, useRef } from "react";
import { Hub } from 'aws-amplify/utils';
import "@aws-amplify/ui-react/styles.css";
import { Form, Typography, Select, message } from "antd";
import { generateClient } from 'aws-amplify/api';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import { listAuctions as listAuctionsQuery } from '../../graphql/queries';
import { calculateTimeDifference, createNewUserCar, fetchAuctionUser } from "../../functions";
import AuctionPageItem from "./AuctionPageItem";
import { SelectedAuctionDetails } from "./SelectedAuctionDetails";
import AuctionActionsModal from "./AuctionActionsModal";

const { Option } = Select;
const client = generateClient();

export default function MyAuctions({ playerInfo, setMoney, money }) {
  const [auctions, setAuctions] = useState([]);
  const [visible, setVisible] = useState(false);
  const [player, setPlayer] = useState("");
  const [loadingBid, setLoadingBid] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
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
      const auctionData = await client.graphql({ query: listAuctionsQuery });
      let auctions = auctionData.data.listAuctions.items.map(auction => {
        const endTime = new Date(parseInt(auction.endTime) * 1000);
        const timeLeft = calculateTimeDifference(endTime);

        // Normalize status property (case insensitive comparison)
        let status = auction.status;
        if (status) {
          // Convert to title case for consistency
          status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        } else {
          // If status is missing, set it based on other properties
          const now = new Date();
          if ((auction.currentBid && auction.buy && auction.currentBid >= auction.buy) ||
              (endTime && endTime < now)) {
            status = 'Finished';
          } else {
            status = 'Active';
          }
        }

        return {
          ...auction,
          endTime,
          timeLeft,
          status
        };
      });

      let filtered = auctions.filter(auction => auction.player === playerInfo?.nickname);

      console.log("MyAuctions - before sorting:", filtered);

      try {
        // Sort auctions: active auctions by end date (ascending), finished auctions at the end
        filtered.sort((a, b) => {
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

      console.log("MyAuctions - after sorting:", filtered);

      setAuctions(filtered);
      filtered.length > 0 && !selectedAuction && setSelectedAuction(filtered[0]);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    }
  }, []);

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
        status: increasedBidValue < auction.buy ? "active" : "finished",
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
            money: auction.lastBidPlayer === playerInfo?.nickname ? money - (increasedBidValue - auction.currentBid) : money - increasedBidValue
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
  
  const buyItem = async () => {
    try {
      if (!selectedAuction || !selectedAuction.id) {
        console.error("Invalid auction for buyItem:", selectedAuction);
        message.error('Cannot buy item: No valid auction selected');
        return;
      }

      setLoadingBuy(true);
      const increasedBidValue = Math.round(selectedAuction.currentBid * 1.1) || Math.round(selectedAuction.minBid * 1.1);
      const updatedAuctionInput = {
        id: selectedAuction.id,
        make: selectedAuction.make,
        model: selectedAuction.model,
        year: selectedAuction.year,
        carId: selectedAuction.carId,
        currentBid: selectedAuction.buy,
        endTime: selectedAuction.endTime,
        status: "Finished",
        finishedAt: new Date().toISOString(), // Add finishedAt when auction is finished
        lastBidPlayer: playerInfo?.nickname,
        player: selectedAuction.player,
        buy: selectedAuction.buy,
        minBid: selectedAuction.minBid,
        type: selectedAuction.type
      };

      setMoney(prevMoney => {
        const bidDifference =
          selectedAuction.lastBidPlayer === playerInfo?.nickname
            ? selectedAuction.buy - selectedAuction.currentBid
            : increasedBidValue;
        return prevMoney - bidDifference;
      });

      const id = selectedAuction.id;

      // Fix the parameter order - fetchAuctionUser expects auctionId as the only parameter
      const auctionUser = await fetchAuctionUser(id);

      console.log('Auction User:', auctionUser);

      // Create an array of promises to execute
      const promises = [
        client.graphql({
          query: mutations.updateAuction,
          variables: { input: updatedAuctionInput },
        }),
        client.graphql({
          query: mutations.updateUser,
          variables: {
            input: {
              id: playerInfo.id,
              money:
                selectedAuction.lastBidPlayer === playerInfo?.nickname
                  ? money - (selectedAuction.buy - selectedAuction.currentBid)
                  : money - increasedBidValue,
            },
          },
        })
      ];

      // Only add the seller update if auctionUser exists
      if (auctionUser) {
        promises.push(
          client.graphql({
            query: mutations.updateUser,
            variables: {
              input: {
                id: auctionUser.id,
                money: auctionUser.money + selectedAuction.buy,
              },
            },
          })
        );
      }

      await Promise.all(promises);

      try {
        await createNewUserCar(playerInfo.id, selectedAuction.carId);
      } catch (error) {
        console.error("Error creating user car:", error);
        // Continue even if this fails
      }

      message.success('Car successfully bought!');
      listAuctions();
    } catch (error) {
      console.error("Buy item error:", error);
      message.error('Failed to buy item');
    } finally {
      setLoadingBuy(false);
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

  console.log("Rendering MyAuctions with auctions:", auctions);

  return (
    <div style={{ display: 'flex', padding: '20px' }} tabIndex={0}>
      <div style={{ flex: 1 }}>
        <div className="auction-items-container">
          {auctions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Typography.Text>No auctions found. You haven't created any auctions yet.</Typography.Text>
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
    </div>
  );
}