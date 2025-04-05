import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './styles.css';

const GroupChatDeletionModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  return (
    <Modal
      title="Delete Group Chat"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="deletion-modal"
      maskClosable={false}
      closable={true}
    >
      <div className="deletion-modal-content">
        <div className="deletion-modal-icon">
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '48px' }} />
        </div>
        <div className="deletion-modal-message">
          <h3>Are you sure you want to delete this group chat?</h3>
          <p>This action cannot be undone. All messages will be permanently deleted.</p>
        </div>
        <div className="deletion-modal-actions">
          <Button onClick={onClose}>
            No, Cancel
          </Button>
          <Button 
            danger 
            type="primary" 
            onClick={onConfirm}
            loading={isDeleting}
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupChatDeletionModal;