// src/components/CreditWarningModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export const CreditWarningModal = ({ isModalVisible, setIsModalVisible }) => {
  const navigate = useNavigate();

  const handleOk = () => {
    navigate('/store');
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle keyboard events for the modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isModalVisible) return;

      // Stop event propagation to prevent parent components from handling the same key events
      event.stopPropagation();

      // Handle specific keys
      if (event.key === "Enter") {
        event.preventDefault();
        handleOk();
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
      }
    };

    // Use capture phase to ensure our handler runs before the parent's handler
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isModalVisible]);

  return (
    <Modal
        title="Insufficient Credits"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add Credits"
              cancelText="Cancel"
              centered
      >
        <p>You have insufficient credits to perform this action. Please add more credits to continue.</p>
      </Modal>
  );
};