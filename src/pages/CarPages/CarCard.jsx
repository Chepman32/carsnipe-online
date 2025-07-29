import React, { useState, useEffect } from "react";
import "./carsPage.css";
import { playOpeningSound, getCarTypeColor, getImageSource as getImageSourceFunc } from "../../functions";
import { useDispatch } from "react-redux";
import { FOCUS_ZONES, setCurrentFocusedElement, setFocusedZone } from "../../redux/slices/focusSlice";
import { useDemoMode } from '../../contexts/DemoModeContext';

export default function CarCard({
  focusedCar,
  selectedCar,
  setSelectedCar,
  showCarDetailsModal,
  car,
  getImageSource, // This can be passed in or we'll use the imported one
  showPrice,
  setFocusedCar,
  setFocusPosition,
  column,
  row,
  playerInfo, // Add playerInfo prop
}) {
  const dispatch = useDispatch();
  const { isDemoMode } = useDemoMode();
  const [imageSrc, setImageSrc] = useState('https://via.placeholder.com/300x200?text=Loading...');
  
  // Use the passed getImageSource function or fall back to the imported one
  const imageSourceFn = getImageSource || getImageSourceFunc;
  
  // Load image when car changes
  useEffect(() => {
    if (car && car.make && car.model) {
      // Always use the async approach to be safe
      const loadImage = async () => {
        try {
          // Check if we're using the local function or the imported one
          if (typeof getImageSource === 'function' && getImageSource !== getImageSourceFunc) {
            // Local function is likely synchronous
            const src = getImageSource(car.make, car.model);
            setImageSrc(src || 'https://via.placeholder.com/300x200?text=No+Image');
          } else {
            // Use the imported async function
            const src = await getImageSourceFunc(car.make, car.model);
            setImageSrc(src);
          }
        } catch (error) {
          console.error('Error loading image:', error);
          setImageSrc('https://via.placeholder.com/300x200?text=No+Image');
        }
      };
      
      loadImage();
    }
  }, [car, getImageSource]);

  // Helper function to get car type letter

  const handleClick = () => {
    playOpeningSound();
    setSelectedCar(car);
    if (setFocusedCar) {
      setFocusedCar(car);
    }
    showCarDetailsModal();
    dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
    if (setFocusPosition) {
      setFocusPosition({ row, column });
    }
  };

  // For demo mode, use the new layout
  if (isDemoMode) {
    return (
      <div
        onClick={handleClick}
        data-car-id={car.id}
        className={focusedCar?.id === car.id ? "carsPage__item carsPage__item_selected" : "carsPage__item"}
      >
        <div className="carsPage__header">
          <div className="carsPage__title">
            <div className="carsPage__subtitle">
              <span className="carsPage__model">{car.model || 'Unknown Model'}</span>
              <span className="carsPage__year">{car.year || ''}</span>
            </div>
          </div>
        </div>
        <div className="carsPage__image-container">
          <img
            src={imageSrc}
            alt={`${car.make || 'Unknown Make'} ${car.model || 'Unknown Model'}`}
            className="carsPage__item__image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
          {showPrice && <div className="carCard__price">{car.price || 0}</div>}
        </div>
        <div
          className={`carsPage__type ${car.type ? car.type.toLowerCase() : 'regular'}`}
          style={{ backgroundColor: getCarTypeColor(car.type ? car.type.toLowerCase() : 'regular') }}
        >
          <span className="carsPage__rating">{car.type || 'COMMON'}</span>
        </div>
      </div>
    );
  }
  
  // For authenticated mode, use the original layout with car-card class
  return (
    <div
      onClick={handleClick}
      data-car-id={car.id}
      className={focusedCar?.id === car.id ? "car-card car-card-focused" : "car-card"}
      data-focused={focusedCar?.id === car.id}
    >
      <div className="car-card-header">
        <div className="car-card-title">
          <div className="car-card-subtitle">
            <span className="car-card-model">{car.model || 'Unknown Model'}</span>
            <span className="car-card-year">{car.year || ''}</span>
          </div>
        </div>
      </div>
      <div className="car-card-image-container">
        <img
          src={imageSrc}
          alt={`${car.make || 'Unknown Make'} ${car.model || 'Unknown Model'}`}
          className="car-card-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        {showPrice && <div className="car-card-price">{car.price || 0}</div>}
      </div>
      <div
        className={`car-card-type ${car.type ? car.type.toLowerCase() : 'regular'}`}
        style={{ backgroundColor: getCarTypeColor(car.type ? car.type.toLowerCase() : 'regular') }}
      >
        <span className="car-card-rating">{car.type || 'COMMON'}</span>
      </div>
    </div>
  );
}