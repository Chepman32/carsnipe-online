import React from "react";
import "./carsPage.css";
import { playOpeningSound, getCarTypeColor } from "../../functions";
import { useDispatch } from "react-redux";
import { FOCUS_ZONES, setCurrentFocusedElement, setFocusedZone } from "../../redux/slices/focusSlice";

export default function CarCard({
  focusedCar,
  selectedCar,
  setSelectedCar,
  showCarDetailsModal,
  car,
  getImageSource,
  showPrice,
  setFocusedCar,
  // Removed setFocusPosition, column, row
}) {
  const dispatch = useDispatch();

  // Helper function to get car type letter
  const getCarTypeLetter = (carType) => {
    switch(carType) {
      case "COMMON": return "B";
      case "RARE": return "A";
      case "EPIC": return "S";
      case "LEGENDARY": return "S1";
      default: return "";
    }
  };

  const handleClick = (e) => {
    // Stop event propagation to prevent parent handlers from interfering
    e.stopPropagation();
    
    console.log("CarCard handleClick called for car:", car);
    playOpeningSound();
    
    // Set the selected car first
    setSelectedCar(car);
    setFocusedCar(car);
    
    // Use a slightly longer delay to ensure state updates have propagated
    setTimeout(() => {
      console.log("About to call showCarDetailsModal");
      showCarDetailsModal();
      console.log("Called showCarDetailsModal");
      
      // Log the current state after calling showCarDetailsModal
      console.log("Current car:", car);
    }, 100);
    
    dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
  };

  return (
    <div
      onClick={handleClick}
      data-car-id={car.id}
      className={focusedCar?.id === car.id ? "carsPage__item carsPage__item_selected" : "carsPage__item"}
    >
      <div className="carsPage__header">
        <div className="carsPage__title">
          <div className="carsPage__subtitle">
            <span className="carsPage__model">{car.model}</span>
            <span className="carsPage__year">{car.year}</span>
          </div>
        </div>
      </div>
      <div className="carsPage__image-container">
        <img
          src={getImageSource(car.make, car.model)}
          alt={`${car.make} ${car.model}`}
          className="carsPage__item__image"
        />
        {showPrice && <div className="carCard__price">{car.price}</div>}
      </div>
      <div
        className={`carsPage__type ${car.type.toLowerCase()}`}
        style={{ backgroundColor: getCarTypeColor(car.type.toLowerCase()) }}
      >
        {getCarTypeLetter(car.type)}
        <span className="carsPage__rating">{car.type}</span>
      </div>
    </div>
  );
}
