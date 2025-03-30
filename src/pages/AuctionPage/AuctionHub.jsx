import React, { useState, useEffect, useCallback } from "react";
import { Card, Col, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import "./auctionPage.css";
import AuctionHubMyBids from "./AuctionHubCards/AuctionHubMyBids";
import AuctionHubMyAuctions from "./AuctionHubCards/AuctionHubMyAuctions";
import AuctionHubStart from "./AuctionHubCards/AuctionHubStart";
import AuctionHubSearch from "./AuctionHubCards/AuctionHubSearch";
import { playOpeningSound, playSwitchSound } from "../../functions";

export default function AuctionsHub() {
  const [focusedTile, setFocusedTile] = useState(""); // No initial focus
  const navigate = useNavigate();

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
      <Row style={{ height: "100vh", margin: "0", boxSizing: "border-box" }}>
        <Col xs={24} md={12} style={{ height: "100%" }}>
          <AuctionHubSearch focused={focusedTile === "search"} />
        </Col>
        <Col xs={24} md={12} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 2 }}>
            <AuctionHubStart focused={focusedTile === "start"} />
          </div>
          <div style={{ flex: 1 }}>
            <AuctionHubMyBids focused={focusedTile === "mybids"} />
          </div>
          <div style={{ flex: 1 }}>
            <AuctionHubMyAuctions focused={focusedTile === "myauctions"} />
          </div>
        </Col>
      </Row>
    </div>
  );
}