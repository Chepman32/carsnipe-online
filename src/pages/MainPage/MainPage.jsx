import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./mainPage.css";
import MainPageLeftTop from "./MainPageCards/MainPageLeftTop";
import MainPageLeftBottom from "./MainPageCards/MainPageLeftBottom";
import MainPageCenter from "./MainPageCards/MainPageCenter";
import MainPageRightTop from "./MainPageCards/MainPageRightTop";
import MainPageRightBottom from "./MainPageCards/MainPageRightBottom";
import { QuickSettingsMenu } from "../../components/QuickSettings/QuickSettingsMenu";
import { playOpeningSound, playSwitchSound } from "../../functions";
import MainPageSettings from "./MainPageCards/MainPageSettings";

export const MainPage = ({ selectedElement, handleElementSelect } = {}) => {
  const initialFocusedTile = sessionStorage.getItem("lastFocusedTile") || "leftTop";
  const [focusedTile, setFocusedTile] = useState(initialFocusedTile);
  const [lastFocusedLeftTile, setLastFocusedLeftTile] = useState("leftTop");
  const [lastFocusedRightTile, setLastFocusedRightTile] = useState("rightTop");
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
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
        if (focusedTile === "rightTop" || focusedTile === "rightBottom" || focusedTile === "settingsBtn") {
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
          setFocusedTile("settingsBtn");
        }
      } else if (key === "ArrowUp") {
        if (focusedTile === "leftBottom") {
          playSwitchSound();
          setFocusedTile("leftTop");
        } else if (focusedTile === "rightBottom") {
          playSwitchSound();
          setFocusedTile("rightTop");
        } else if (focusedTile === "settingsBtn") {
          playSwitchSound();
          setFocusedTile("rightBottom");
        }
      } else if (key === "Enter" && !settingsMenuOpen) {
        playOpeningSound();
        sessionStorage.setItem("lastFocusedTile", focusedTile);

        switch (focusedTile) {
          case "leftTop":
            navigate("/myCars");
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
          case "settingsBtn":
            navigate("/settings");
            break;
          default:
            break;
        }
      }
    },
    [focusedTile, lastFocusedLeftTile, lastFocusedRightTile, navigate, settingsMenuOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleMouseEnter = (tile) => {
    setFocusedTile(tile);
  };

  const handleTileClick = (tileName) => {
    console.log("handleTileClick called with:", tileName);
    
    if (settingsMenuOpen) {
      console.log("Settings menu is open, closing it");
      setSettingsMenuOpen(false);
      return;
    }

    console.log("Playing sound and navigating...");
    playOpeningSound();
    sessionStorage.setItem("lastFocusedTile", tileName);

    switch (tileName) {
      case "leftTop":
        console.log("Navigating to /myCars");
        navigate("/myCars");
        break;
      case "leftBottom":
        console.log("Navigating to /carsStore");
        navigate("/carsStore");
        break;
      case "center":
        console.log("Navigating to /auctionsHub");
        navigate("/auctionsHub");
        break;
      case "rightTop":
        console.log("Navigating to /store");
        navigate("/store");
        break;
      case "rightBottom":
        console.log("Navigating to /profileEditPage");
        navigate("/profileEditPage");
        break;
      case "settingsBtn":
        console.log("Navigating to /settings");
        navigate("/settings");
        break;
      default:
        console.log("Unknown tile name:", tileName);
        break;
    }
  };



  return (
    <>
      <div className="mainPage" onKeyDown={handleKeyDown} tabIndex={0}>
        <div className="column">
          <MainPageLeftTop
            focused={focusedTile === "leftTop"}
            handleMouseEnter={handleMouseEnter}
            onClick={() => handleTileClick("leftTop")}
          />
          <MainPageLeftBottom
            focused={focusedTile === "leftBottom"}
            handleMouseEnter={handleMouseEnter}
            onClick={() => handleTileClick("leftBottom")}
          />
        </div>
        <div className="column">
          <MainPageCenter
            focused={focusedTile === "center"}
            handleMouseEnter={handleMouseEnter}
            onClick={() => handleTileClick("center")}
            isMenuOpen={settingsMenuOpen}
          />
        </div>
        <div className="column">
          <MainPageRightTop
            focused={focusedTile === "rightTop"}
            handleMouseEnter={handleMouseEnter}
            onClick={() => handleTileClick("rightTop")}
          />
          <MainPageRightBottom
            focused={focusedTile === "rightBottom"}
            handleMouseEnter={handleMouseEnter}
            onClick={() => handleTileClick("rightBottom")}
          />
          <MainPageSettings
            focused={focusedTile === "settingsBtn"}
            handleMouseEnter={handleMouseEnter}
            onClick={() => handleTileClick("settingsBtn")}
          />
        </div>
      </div>
      {/* <QuickSettingsMenu
        isMenuOpen={settingsMenuOpen}
        setIsMenuOpen={setSettingsMenuOpen}
      /> */}
    </>
  );
};