import React, { useEffect, useState, useRef } from "react";
import { Spin, Tooltip, message } from "antd";
import "../CarPages/carsPage.css";
import "./UserPage.css";
import CarDetailsModalRow from "../CarPages/CarDetailsModalRow";
import { getImageSource, playSwitchSound } from "../../functions";
import { isMobile } from "react-device-detect";

// Create a custom modal implementation for UserPage
const UserCarDetailsModal = ({
  visible,
  handleCancel,
  selectedCar,
  buyCar,
  loadingBuy,
  getImageSource: customGetImageSource,
  fromMyCars = false, // Add a prop to indicate if the modal was opened from MyCars
}) => {
  const totalRows = 3; // We have 3 options
  const [focusedRow, setFocusedRow] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const modalRef = useRef(null);
  
  // Use the passed getImageSource function or fall back to the imported one
  const imageSourceFn = customGetImageSource || getImageSource;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      if (visible) {
        // Stop propagation to prevent parent components from handling the same key events
        event.stopPropagation();
        
        if (key === "ArrowUp") {
          playSwitchSound();
          setFocusedRow((prevRow) => (prevRow === 0 ? totalRows - 1 : prevRow - 1));
        } else if (key === "ArrowDown") {
          playSwitchSound();
          setFocusedRow((prevRow) => (prevRow === totalRows - 1 ? 0 : prevRow + 1));
        } else if (key === "Enter") {
          switch (focusedRow) {
            case 0:
              // Show car info
              message.info(`Car info: ${selectedCar?.make} ${selectedCar?.model} (${selectedCar?.year})`);
              break;
            case 1:
              // Buy the same one
              buyCar(selectedCar);
              break;
            case 2:
              // Show car history
              message.info(`Car history for: ${selectedCar?.make} ${selectedCar?.model}`);
              break;
            default:
              break;
          }
        } else if (key === "Escape") {
          handleCancel();
        }
      } else {
        setFocusedRow(0);
      }
    };

    // Use capture phase to ensure our handler runs before parent handlers
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [visible, focusedRow, selectedCar, buyCar, totalRows, handleCancel]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Focus the modal when it becomes visible and handle window resize
  useEffect(() => {
    if (visible && modalRef.current) {
      modalRef.current.focus();
      
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle window resize to ensure modal stays centered
      const handleResize = () => {
        // No need to force reflow - the fixed positioning will keep it centered
      };
      
      // Add resize event listener
      window.addEventListener('resize', handleResize);
      
      // Return cleanup function
      return () => {
        // Restore body scrolling when modal is closed
        document.body.style.overflow = '';
        
        // Remove resize event listener
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [visible]);
  
  // If not visible, don't render anything
  if (!visible) {
    return null;
  }
  
  return (
    <div 
      className="custom-modal-overlay"
      onClick={handleCancel}
    >
      <div 
        ref={modalRef}
        className="carDetailsModal"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ textAlign: "center", fontWeight: "700", margin: 0, flex: 1 }}>
            {selectedCar?.make} {selectedCar?.model}
          </h3>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              padding: '0 10px'
            }} 
            onClick={handleCancel}
          >
            ×
          </button>
        </div>
        
        {selectedCar && (
          <>
            {/* Only show the image if fromMyCars is true */}
            {fromMyCars && (
              <img
                src={imageSourceFn(selectedCar.make, selectedCar.model)}
                alt={`${selectedCar.make} ${selectedCar.model}`}
                className="carsPage__modal__image"
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: 'auto',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  margin: '0 auto 20px',
                  display: 'block',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
            
            {/* Show car info row */}
            <div style={{ marginBottom: '10px' }}>
              <CarDetailsModalRow 
                text="Show car info" 
                selected={focusedRow === 0} 
                handler={() => message.info(`Car info: ${selectedCar?.make} ${selectedCar?.model} (${selectedCar?.year})`)}
              />
            </div>
            
            {/* Buy the same one row */}
            <div style={{ marginBottom: '10px' }}>
              <CarDetailsModalRow 
                text="Buy the same one" 
                selected={focusedRow === 1} 
                handler={() => buyCar(selectedCar)}
                loading={loadingBuy}
              />
            </div>
            
            {/* Show car history row */}
            <div style={{ marginBottom: '10px' }}>
              <CarDetailsModalRow 
                text="Show car history" 
                selected={focusedRow === 2} 
                handler={() => message.info(`Car history for: ${selectedCar?.make} ${selectedCar?.model}`)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserCarDetailsModal;