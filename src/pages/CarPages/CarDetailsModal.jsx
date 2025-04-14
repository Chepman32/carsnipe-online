import React, { useEffect, useState, useRef } from "react";
import { Spin, Tooltip } from "antd";
import "./carsPage.css";
import CarDetailsModalRow from "./CarDetailsModalRow";
import { getImageSource, playSwitchSound } from "../../functions";
import { isMobile } from "react-device-detect";

// Create a completely custom modal implementation
const CarDetailsModal = ({
  visible,
  handleCancel,
  selectedCar,
  buyCar,
  loadingNewAuction,
  loadingBuy,
  forAuction,
  showNewAuction,
  removeCar,
}) => {
  const totalRows = 6;
  const [focusedRow, setFocusedRow] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const modalRef = useRef(null);

  // Log when component mounts/unmounts and when props change
  useEffect(() => {
    console.log("CarDetailsModal mounted or updated with visible:", visible);
    return () => console.log("CarDetailsModal unmounted");
  }, [visible]);

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
              if (forAuction) {
                showNewAuction();
              }
              if (!forAuction) {
                buyCar(selectedCar);
              }
              break;
            case 1:
              break;
            case 2:
              break;
            case 3:
              break;
            case 4:
              handleCancel();
              removeCar && removeCar(selectedCar.id);
              break;
            case 5:
              handleCancel();
              removeCar && removeCar(selectedCar.id, true);
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
  }, [visible, focusedRow, selectedCar, buyCar, showNewAuction, forAuction, totalRows, removeCar, handleCancel]);

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
      
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Handle window resize to ensure modal stays centered
      const handleResize = () => {
        if (modalRef.current) {
          // Force a reflow to ensure the modal is properly centered
          modalRef.current.style.display = 'none';
          setTimeout(() => {
            if (modalRef.current) {
              modalRef.current.style.display = 'block';
            }
          }, 0);
        }
      };
      
      // Add resize event listener
      window.addEventListener('resize', handleResize);
      
      // Return cleanup function
      return () => {
        // Restore body scrolling when modal is closed
        document.body.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
        
        // Remove resize event listener
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [visible]);

  // Add extensive debugging logs
  console.log("CarDetailsModal rendering with visible:", visible, "selectedCar:", selectedCar);
  console.log("CarDetailsModal props:", { visible, selectedCar, forAuction, loadingBuy });
  
  // If not visible, don't render anything
  if (!visible) {
    console.log("CarDetailsModal not rendering because visible is false");
    return null;
  }
  
  // Log that we're about to render the modal
  console.log("CarDetailsModal is visible, rendering modal content");
  
  return (
    <div 
      className="custom-modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        // Ensure the overlay covers the entire viewport regardless of scroll position
        width: '100vw',
        height: '100vh',
        // Reset any scroll position
        overflow: 'hidden'
      }}
      onClick={handleCancel}
    >
      <div 
        ref={modalRef}
        className="carDetailsModal"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          width: isMobile ? '80vw' : '50vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10000,
          // Ensure the modal is centered in the viewport
          margin: 'auto',
          // Add a transform to ensure perfect centering
          transform: 'translateY(0)'
        }}
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
            {forAuction && (
              <img
                src={getImageSource(selectedCar.make, selectedCar.model)}
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
            
            {!forAuction && (
              <div style={{ marginBottom: '10px' }}>
                <CarDetailsModalRow
                  selected={focusedRow === 0}
                  title="Buy car"
                  handler={() => buyCar(selectedCar)}
                  text={loadingBuy ? <Spin /> : "Buy"}
                  loading={loadingBuy}
                  price={selectedCar.price}
                  isOnline={isOnline}
                />
              </div>
            )}
            
            {forAuction && (
              <div style={{ marginBottom: '10px', opacity: !isOnline ? 0.5 : 1 }}>
                <Tooltip title={!isOnline ? "This feature requires internet connection" : ""}>
                  <div>
                    <CarDetailsModalRow
                      handler={isOnline ? showNewAuction : undefined}
                      text={loadingNewAuction ? <Spin /> : "Sell on auction"}
                      selected={focusedRow === 0}
                      disabled={!isOnline}
                    />
                  </div>
                </Tooltip>
              </div>
            )}
            
            <div style={{ marginBottom: '10px' }}>
              <CarDetailsModalRow text="Show car info" selected={focusedRow === 1} />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <CarDetailsModalRow text="Choose color" selected={focusedRow === 2} />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <CarDetailsModalRow text="Buy as a gift" selected={focusedRow === 3} />
            </div>
            
            {forAuction && (
              <div style={{ marginBottom: '10px' }}>
                <CarDetailsModalRow
                  text="Remove the car from garage"
                  selected={focusedRow === 4}
                  handler={() => {
                    handleCancel();
                    removeCar(selectedCar.id);
                  }}
                  style={{ color: "red" }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CarDetailsModal;
