import React from 'react';
import "./styles.css";

export default function AuctionActionsModalRow({handler, text, selected}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      console.log("Key pressed in AuctionActionsModalRow:", e.key);
      handler();
    }
  };

  return (
    <div
      className={selected ? "auctionActionsModal__row_selected" : "auctionActionsModal__row"}
      onClick={handler}
      onKeyDown={handleKeyDown}
      role="button"
      aria-pressed={selected}
      tabIndex={0}
    >
      {text}
    </div>
  );
}
