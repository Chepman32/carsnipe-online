import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./mainPage.css";
import MainPageLeftTop from "./MainPageCards/MainPageLeftTop";
import MainPageLeftBottom from "./MainPageCards/MainPageLeftBottom";
import MainPageCenter from "./MainPageCards/MainPageCenter";
import MainPageRightTop from "./MainPageCards/MainPageRightTop";
import MainPageRightBottom from "./MainPageCards/MainPageRightBottom";
import { playOpeningSound, playSwitchSound } from "../../functions";

export const MainPage = () => {
  // Check sessionStorage for a saved tile, defaulting to "leftTop" if none is found
  const initialFocusedTile = sessionStorage.getItem("lastFocusedTile") || "leftTop";
  const [focusedTile, setFocusedTile] = useState(initialFocusedTile);
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (event) => {
      const { key } = event;
      if (key === "ArrowRight" && focusedTile === "leftTop") {
        playSwitchSound();
        setFocusedTile("center");
      } else if (key === "ArrowRight" && focusedTile === "leftBottom") {
        playSwitchSound();
        setFocusedTile("center");
      } else if (key === "ArrowRight" && focusedTile === "center") {
        playSwitchSound();
        setFocusedTile("rightTop");
      } else if (key === "ArrowLeft" && focusedTile === "rightBottom") {
        playSwitchSound();
        setFocusedTile("center");
      } else if (key === "ArrowLeft" && focusedTile === "leftBottom") {
        // Do nothing for leftBottom
      } else if (key === "ArrowLeft" && focusedTile !== "leftTop") {
        playSwitchSound();
        setFocusedTile("leftTop");
      } else if (
        key === "ArrowDown" &&
        focusedTile !== "center" &&
        focusedTile !== "rightBottom" &&
        focusedTile !== "leftBottom"
      ) {
        setFocusedTile((prevTile) =>
          prevTile === "leftTop"
            ? "leftBottom"
            : prevTile === "leftBottom"
            ? "rightTop"
            : prevTile === "rightTop"
            ? "rightBottom"
            : prevTile
        );
        playSwitchSound();
      } else if (
        key === "ArrowUp" &&
        focusedTile !== "center" &&
        focusedTile !== "leftTop" &&
        focusedTile !== "rightTop"
      ) {
        setFocusedTile((prevTile) =>
          prevTile === "rightBottom"
            ? "rightTop"
            : prevTile === "rightTop"
            ? "leftBottom"
            : prevTile === "leftBottom"
            ? "leftTop"
            : prevTile
        );
        playSwitchSound();
      } else if (key === "Enter") {
        playOpeningSound();

        // Store the focused tile before navigating away
        sessionStorage.setItem("lastFocusedTile", focusedTile);

        switch (focusedTile) {
          case "leftTop":
            navigate("/mycars");
            break;
          case "leftBottom":
            navigate("/carsStore");
            break;
          case "center":
            navigate("/auctionsHub");
            break;
          case "rightTop":
            navigate("/store");
            break;
          case "rightBottom":
            navigate("/profileEditPage");
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

  const handleMouseEnter = (tile) => {
    setFocusedTile(tile);
  };

  return (
    <div className="mainPage" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="column">
        <MainPageLeftTop focused={focusedTile === "leftTop"} handleMouseEnter={handleMouseEnter} />
        <MainPageLeftBottom focused={focusedTile === "leftBottom"} handleMouseEnter={handleMouseEnter} />
      </div>
      <div className="column">
        <MainPageCenter focused={focusedTile === "center"} handleMouseEnter={handleMouseEnter} />
      </div>
      <div className="column">
        <MainPageRightTop focused={focusedTile === "rightTop"} handleMouseEnter={handleMouseEnter} />
        <MainPageRightBottom focused={focusedTile === "rightBottom"} handleMouseEnter={handleMouseEnter} />
      </div>
    </div>
  );
};