import React, { useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './UserProfileButton.css';

/**
 * A button component that navigates to a user's profile page
 *
 * @param {Object} props - Component props
 * @param {string} props.userId - The ID of the user whose profile to open
 * @param {string} [props.buttonText="Open user's profile"] - Text to display on the button
 * @param {string} [props.tooltipText="View this user's profile"] - Text to display in the tooltip
 * @param {string} [props.type="default"] - Button type (primary, default, etc.)
 * @param {string} [props.size="middle"] - Button size (small, middle, large)
 * @param {Object} [props.style] - Additional inline styles
 * @param {string} [props.className] - Additional CSS class names
 * @param {boolean} [props.showErrorMessage=true] - Whether to show an error message if userId is invalid
 */
const UserProfileButton = ({
  userId,
  buttonText = "Open user's profile",
  tooltipText = "View this user's profile",
  type = "default",
  size = "middle",
  style = {},
  className = "",
  showErrorMessage = true,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (!userId) {
      if (showErrorMessage) {
        message.error('Cannot open profile: User ID is missing');
      }
      return;
    }

    setLoading(true);

    // Add a small delay to show loading state
    setTimeout(() => {
      navigate(`/user/${userId}`);
      setLoading(false);
    }, 300);
  };

  return (
    <Tooltip title={userId ? tooltipText : 'User ID is missing'}>
      <Button
        type={type}
        size={size}
        icon={<UserOutlined />}
        onClick={handleClick}
        className={`user-profile-button ${className}`}
        style={style}
        disabled={!userId}
        loading={loading}
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
};

export default UserProfileButton;