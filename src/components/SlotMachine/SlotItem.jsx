import React from 'react'
import { getImageSource } from '../../functions'
import "./slotMachine.css"

export default function SlotItem(item) {
  return (
    <div className="slotItem">
          {React.createElement(
            'img',
            {
              src: typeof getImageSource === 'function' ? 
                (item && item.make && item.model ? 
                  getImageSource(item.make, item.model) : '') : '',
              alt: "",
              className: "slotItem__image",
              onError: (e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
              }
            }
          )}
          .slotItem
          <div className="slotItem__make">
            <p className="slotItem__make">{item.make}</p>
          </div>
    </div>
  )
}
