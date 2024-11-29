import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./mainPage.css";
import MainPageLeftTop from "./MainPageCards/MainPageLeftTop";
import MainPageLeftBottom from "./MainPageCards/MainPageLeftBottom";
import MainPageCenter from "./MainPageCards/MainPageCenter";
import MainPageRightTop from "./MainPageCards/MainPageRightTop";
import MainPageRightBottom from "./MainPageCards/MainPageRightBottom";
import { playOpeningSound, playSwitchSound } from "../../functions";
import MainPageExit from "./MainPageCards/MainPageExit";

export const MainPage = () => {
  const initialFocusedTile = sessionStorage.getItem("lastFocusedTile") || "leftTop";
  const [focusedTile, setFocusedTile] = useState(initialFocusedTile);
  const [lastFocusedLeftTile, setLastFocusedLeftTile] = useState("leftTop");
  const [lastFocusedRightTile, setLastFocusedRightTile] = useState("rightTop");
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (event) => {
      const { key } = event;

      if (key === "ArrowRight") {
        if (focusedTile === "leftTop" || focusedTile === "leftBottom") {
          setLastFocusedLeftTile(focusedTile);
          playSwitchSound();
          setFocusedTile("center");
        } else if (focusedTile === "center") {
          playSwitchSound();
          setFocusedTile(lastFocusedRightTile);
        }
      } else if (key === "ArrowLeft") {
        if (focusedTile === "rightTop" || focusedTile === "rightBottom" || focusedTile === "exitBtn") {
          setLastFocusedRightTile(focusedTile);
          playSwitchSound();
          setFocusedTile("center");
        } else if (focusedTile === "center") {
          playSwitchSound();
          setFocusedTile(lastFocusedLeftTile);
        }
      } else if (key === "ArrowDown") {
        if (focusedTile === "leftTop") {
          playSwitchSound();
          setFocusedTile("leftBottom");
        } else if (focusedTile === "rightTop") {
          playSwitchSound();
          setFocusedTile("rightBottom");
        } else if (focusedTile === "rightBottom") {
          playSwitchSound();
          setFocusedTile("exitBtn");
        }
      } else if (key === "ArrowUp") {
        if (focusedTile === "leftBottom") {
          playSwitchSound();
          setFocusedTile("leftTop");
        } else if (focusedTile === "rightBottom") {
          playSwitchSound();
          setFocusedTile("rightTop");
        } else if (focusedTile === "exitBtn") {
          playSwitchSound();
          setFocusedTile("rightBottom");
        }
      } else if (key === "Enter") {
        playOpeningSound();
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
          case "exitBtn":
            navigate("/profileEditPage");
            break;
          default:
            break;
        }
      }
    },
    [focusedTile, lastFocusedLeftTile, lastFocusedRightTile, navigate]
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
        <MainPageExit focused={focusedTile === "exitBtn"} handleMouseEnter={handleMouseEnter} />
      </div>
    </div>
  );
};