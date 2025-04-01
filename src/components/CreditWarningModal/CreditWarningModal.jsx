// src/components/CreditWarningModal.js
import React, { useState, useEffect, useRef } from 'react';
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

  // Reference to the modal container
  const modalRef = useRef(null);

  // Focus the modal when it becomes visible
  useEffect(() => {
    if (isModalVisible && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isModalVisible]);

  // Handle keyboard events for the modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isModalVisible) return;

      // Stop event propagation to prevent parent components from handling the same key events
      event.stopPropagation();

      // Prevent default browser behavior for these keys
      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault();
      }

      // Handle specific keys
      if (event.key === "Enter") {
        handleOk();
      } else if (event.key === "Escape") {
        handleCancel();
      }
    };

    // Use capture phase to ensure our handler runs before the parent's handler
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isModalVisible, handleOk, handleCancel]);

  return (
    <Modal
        title="Insufficient Credits"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add Credits"
        cancelText="Cancel"
        centered
        modalRender={(modal) => (
          <div ref={modalRef} tabIndex={-1} style={{ outline: 'none' }}>
            {modal}
          </div>
        )}
      >
        <p>You have insufficient credits to perform this action. Please add more credits to continue.</p>
      </Modal>
  );
};