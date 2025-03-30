import React, { useState, useEffect, useCallback, useRef } from "react";
import { Hub } from 'aws-amplify/utils';
import "@aws-amplify/ui-react/styles.css";
import { Form, Select, message } from "antd";
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import { getAuction as getAuctionQuery, getUser } from '../../graphql/queries';
import { fetchUserBiddedList } from "../../functions";
import AuctionPageItem from "./AuctionPageItem";
import { SelectedAuctionDetails } from "./SelectedAuctionDetails";
import AuctionActionsModal from "./AuctionActionsModal";

const { Option } = Select;
const client = generateClient();

export default function MyBids({ playerInfo, setMoney, money }) {
  const [auctions, setAuctions] = useState([]);
  const [userCars, setUserCars] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [auctionDuration, setAuctionDuration] = useState(1);
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
      const validAuctions = auctionsData.filter(auction => auction !== null);
      
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
      setMoney(auction.lastBidPlayer === playerInfo.nickname ? money - (increasedBidValue - auction.currentBid) : money - increasedBidValue)
      const updatedAuction = {
        id: auction.id,
        carName: auction.carName,
        player: auction.player,
        buy: auction.buy,
        minBid: auction.minBid,
        currentBid: increasedBidValue,
        endTime: auction.endTime,
        lastBidPlayer: playerInfo.nickname,
        status: increasedBidValue < auction.buy ? "Active" : "Finished",
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
  
  const buyItem = async () => {
    try {
      setLoadingBuy(true);
  
      const increasedBidValue = Math.round(selectedAuction.currentBid * 1.1) || Math.round(selectedAuction.minBid * 1.1);
  
      const updatedAuction = {
        ...selectedAuction,
        currentBid: selectedAuction.buy,
        lastBidPlayer: playerInfo.nickname,
        status: "Finished",
      };
  
      setMoney((prevMoney) => {
        const bidDifference = selectedAuction.lastBidPlayer === playerInfo.nickname
          ? selectedAuction.buy - selectedAuction.currentBid
          : increasedBidValue;
        
        return prevMoney - bidDifference;
      });
  
      await Promise.all([
        client.graphql({
          query: mutations.updateAuction,
          variables: { input: updatedAuction },
        }),
        client.graphql({
          query: mutations.updateUser,
          variables: {
            input: {
              id: playerInfo.id,
              money: selectedAuction.lastBidPlayer === playerInfo.nickname ? money - (selectedAuction.buy - selectedAuction.currentBid) : money - increasedBidValue
            },
          },
        }),
      ]);
  
      message.success('Car successfully bought!');
      listAuctions();
    } catch (error) {
      console.error(error);
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

  return (
    <div style={{ display: 'flex', padding: '20px' }} tabIndex={0}>
      <div style={{ flex: 1 }}>
        <div className="auction-items-container">
          {auctions.map((auction, index) => {
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
          })}
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