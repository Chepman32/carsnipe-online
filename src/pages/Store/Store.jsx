// Store.js

import React, { useEffect, useCallback, useState } from "react";
import "./store.css";
import coin_symbol from "../../assets/icons/coin_symbol.png";
import { useDispatch, useSelector } from "react-redux";
import { handleKeyDown, setFocusedZone, setStoreItemsCount, FOCUS_ZONES } from "../../redux/slices/focusSlice";
import CloudPaymentsPayment from "../../components/CloudPaymentsPayment/CloudPaymentsPayment";

const StoreItemCard = ({ item, isFocused, onPurchase }) => {
  return (
    <button
      onClick={() => onPurchase(item)}
      className={`store-item-card ${isFocused ? "focused" : ""}`}
      aria-current={isFocused ? "true" : "false"}
      tabIndex={isFocused ? 0 : -1}
    >
      <img src={coin_symbol} alt={item.name} className="item-image" />
      <h2 className="item-quantity">{item.name}</h2>
      <p className="item-price">{item.price.toLocaleString()} $</p>
    </button>
  );
};

const Store = ({ email, username, userId }) => {
  const dispatch = useDispatch();
  const storeFocusedIndex = useSelector((state) => state.focus.storeFocusedIndex);
  const focusedZone = useSelector((state) => state.focus.focusedZone);
  const currentRoute = useSelector((state) => state.focus.currentRoute);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const items = [
    {
      id: 1,
      name: "50,000 CR",
      price: 1.99,
      credits: 50000
    },
    {
      id: 2,
      name: "100,000 CR",
      price: 3.99,
      credits: 100000
    },
    {
      id: 3,
      name: "200,000 CR",
      price: 6.99,
      credits: 200000
    },
    {
      id: 4,
      name: "300,000 CR",
      price: 10.99,
      credits: 300000
    },
    {
      id: 5,
      name: "500,000 CR",
      price: 15.99,
      credits: 500000
    },
    {
      id: 6,
      name: "1,000,000 CR",
      price: 25.99,
      credits: 1000000
    }
  ];

  useEffect(() => {
    dispatch(setStoreItemsCount(items.length));
    dispatch(setFocusedZone(FOCUS_ZONES.STORE));
  }, [dispatch, items.length]);

  const onKeyDown = useCallback(
    (e) => {
      const { key } = e;
      if (focusedZone === FOCUS_ZONES.STORE && currentRoute === "/store") {
        if (key === "ArrowRight") {
          if (storeFocusedIndex < items.length - 1) {
            dispatch(handleKeyDown("ArrowRight"));
          }
        } else if (key === "ArrowLeft") {
          if (storeFocusedIndex > 0) {
            dispatch(handleKeyDown("ArrowLeft"));
          }
        } else {
          dispatch(handleKeyDown(key));
        }
        e.preventDefault();
      }
    },
    [dispatch, focusedZone, storeFocusedIndex, currentRoute]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter" && focusedZone === FOCUS_ZONES.STORE && currentRoute === "/store") {
        const focusedItem = items[storeFocusedIndex];
        if (focusedItem) {
          handlePurchase(focusedItem);
        }
      }
    };
    window.addEventListener("keydown", handleEnter);
    return () => {
      window.removeEventListener("keydown", handleEnter);
    };
  }, [storeFocusedIndex, items, focusedZone, currentRoute]);

  const handlePurchase = (item) => {
    setSelectedItem(item);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (payment) => {
    console.log('Payment successful:', payment);
    setShowPayment(false);
    setSelectedItem(null);
    // You can add additional success handling here
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setShowPayment(false);
    setSelectedItem(null);
    // You can add additional error handling here
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedItem(null);
  };

  return (
    <div>
      <section className="store-container">
        {items.map((item, index) => (
          <StoreItemCard
            key={item.id}
            item={item}
            isFocused={focusedZone === FOCUS_ZONES.STORE && storeFocusedIndex === index}
            onPurchase={handlePurchase}
          />
        ))}
      </section>

      {showPayment && selectedItem && (
        <CloudPaymentsPayment
          amount={selectedItem.price}
          credits={selectedItem.credits}
          description={`Purchase ${selectedItem.name} for ${username}`}
          email={email}
          userId={userId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default Store;