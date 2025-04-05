import React from 'react';
import { Modal, Button } from 'antd';

const GroupChatDeletionModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      title="Delete Group Chat"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="no" onClick={onClose}>
          No
        </Button>,
        <Button key="yes" type="primary" danger onClick={onConfirm}>
          Yes
        </Button>,
      ]}
    >
      <p>Are you sure you want to delete this group chat? This action cannot be undone.</p>
    </Modal>
  );
};

export default GroupChatDeletionModal;
