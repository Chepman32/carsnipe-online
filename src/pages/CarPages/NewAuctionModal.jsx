import { Form, Input, Select, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const { Option } = Select;

export default function NewAuctionModal({ open, handleCancel, handleOk, selectedCar, buy, setBuy, minBid, setMinBid, setAuctionDuration, auctionDuration }) {
  console.log("NewAuctionModal init render with props:", { open, selectedCar: selectedCar ? selectedCar.id : null });

  const [form] = Form.useForm();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log("open prop changed to:", open);
    setIsVisible(Boolean(open));
  }, [open]);

  useEffect(() => {
    if (selectedCar && selectedCar.price) {
      console.log("Setting initial values for auction with car price:", selectedCar.price);
      setMinBid(selectedCar.price / 20);
      setAuctionDuration(1);
    }
  }, [selectedCar, setMinBid, setAuctionDuration]);

  if (!isVisible || !selectedCar) {
    console.log("Not rendering NewAuctionModal - isVisible:", isVisible, "selectedCar:", !!selectedCar);
    return null;
  }

  console.log("Rendering NewAuctionModal portal with car:", selectedCar.id);

  return createPortal(
    <div 
      className="custom-modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        overflow: 'hidden',
        touchAction: 'none'
      }}
      onClick={handleCancel}
    >
      <div 
        className="auction-modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          width: '50vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ textAlign: "center", fontWeight: "700", margin: 0, flex: 1 }}>
            Create a New Auction
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
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item name="minBid" label="Minimal bid" rules={[{ required: true }]}>
            <Select 
              value={minBid} 
              onChange={(value) => setMinBid(value)} 
              getPopupContainer={() => document.body}
              dropdownStyle={{ zIndex: 11000 }}
            >
              <Option value={selectedCar.price / 20}>{Math.floor(selectedCar.price / 20)}</Option>
              <Option value={selectedCar.price / 10}>{Math.floor(selectedCar.price / 10)}</Option>
              <Option value={selectedCar.price / 5}>{Math.floor(selectedCar.price / 5)}</Option>
              <Option value={selectedCar.price / 2}>{Math.floor(selectedCar.price / 2)}</Option>
              <Option value={selectedCar.price}>{selectedCar.price}</Option>
            </Select>
          </Form.Item>
          <Form.Item name="buy" label="Buy" rules={[{ required: true }]}>
            <Input type="number" value={selectedCar.price} onChange={(event) => setBuy(event.target.value)} disabled />
          </Form.Item>
          <Form.Item name="auctionDuration" label="Auction Duration (hours)" rules={[{ required: true }]}>
            <Select 
              value={auctionDuration} 
              onChange={(value) => setAuctionDuration(value)} 
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              dropdownStyle={{ zIndex: 11000 }}
            >
              <Option value={1}>1 hour</Option>
              <Option value={3}>3 hours</Option>
              <Option value={6}>6 hours</Option>
              <Option value={12}>12 hours</Option>
              <Option value={24}>24 hours</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" onClick={handleOk}>Create</Button>
          </div>
        </Form>
      </div>
    </div>,
    document.body
  );
}