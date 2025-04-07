import React, { useState, useEffect, useCallback } from "react";
import { Card, Col, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import "./auctionPage.css";
import "./auctionHub.css"; // Import the specific hub CSS
import AuctionHubMyBids from "./AuctionHubCards/AuctionHubMyBids";
import AuctionHubMyAuctions from "./AuctionHubCards/AuctionHubMyAuctions";
import AuctionHubStart from "./AuctionHubCards/AuctionHubStart";
import AuctionHubSearch from "./AuctionHubCards/AuctionHubSearch";
import { playOpeningSound, playSwitchSound } from "../../functions";

export default function AuctionsHub() {
  const [focusedTile, setFocusedTile] = useState(""); // No initial focus
  const navigate = useNavigate();

  // Add a class to the body element to prevent scrolling
  useEffect(() => {
    document.body.classList.add('hub-page-active');

    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('hub-page-active');
    };
  }, []);

  // Optionally, keep sessionStorage logic but only apply it on explicit user action, not page load
  // Remove this useEffect if you don't want any persistence
  useEffect(() => {
    const savedTile = sessionStorage.getItem("lastFocusedTile");
    if (savedTile) {
      setFocusedTile(savedTile); // Comment this out to disable initial focus entirely
    }
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      const { key } = event;
      if (key === "ArrowRight" && focusedTile === "search") {
        playSwitchSound();
        setFocusedTile("start");
      } else if (key === "ArrowLeft" && focusedTile !== "search") {
        playSwitchSound();
        setFocusedTile("search");
      } else if (key === "ArrowDown" && focusedTile !== "search" && focusedTile !== "myauctions") {
        setFocusedTile((prevTile) =>
          prevTile === "start" ? "mybids" : prevTile === "mybids" ? "myauctions" : prevTile
        );
        playSwitchSound();
      } else if (key === "ArrowUp" && focusedTile !== "search" && focusedTile !== "start") {
        setFocusedTile((prevTile) =>
          prevTile === "myauctions" ? "mybids" : prevTile === "mybids" ? "start" : prevTile
        );
        playSwitchSound();
      } else if (key === "Enter") {
        playOpeningSound();
        sessionStorage.setItem("lastFocusedTile", focusedTile); // Store only on navigation
        switch (focusedTile) {
          case "search":
            navigate("/auctions");
            break;
          case "start":
            navigate("/myCars");
            break;
          case "mybids":
            navigate("/myBids");
            break;
          case "myauctions":
            navigate("/myAuctions");
            break;
          default:
            break;
        }
      }
    },
    [focusedTile, navigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedTile, handleKeyDown]);

  return (
    <div className="auctionsHub" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="hub-container">
        <div className="hub-item search-item">
          <AuctionHubSearch focused={focusedTile === "search"} />
        </div>
        <div className="hub-item start-item">
          <AuctionHubStart focused={focusedTile === "start"} />
        </div>
        <div className="hub-item bids-item">
          <AuctionHubMyBids focused={focusedTile === "mybids"} />
        </div>
        <div className="hub-item auctions-item">
          <AuctionHubMyAuctions focused={focusedTile === "myauctions"} />
        </div>
      </div>
    </div>
  );
}