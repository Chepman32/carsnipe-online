import React, { useState, useEffect } from 'react';
import './styles.css';
import { generateClient } from 'aws-amplify/api';
import { useNavigate } from 'react-router-dom';
import { Input, Avatar, Button, List, Tag, Spin, message } from 'antd';
import { UserOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import { selectAvatar } from '../../functions';

// We'll use the auto-generated mutations directly

const client = generateClient();

const CreateGroupChatModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.id) {
          setCurrentUser(userInfo);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch all users when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUsers();
    }
  }, [isOpen, currentUser]);

  const fetchUsers = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userData = await client.graphql({ query: queries.listUsers });

      // Filter out the current user from the list
      const otherUsers = userData.data.listUsers.items.filter(
        user => user.id !== currentUser.id
      );

      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.nickname?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeSelectedUser = (user) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
  };

  const handleCreateGroupChat = async () => {
    if (!currentUser) {
      message.error("You must be logged in to create a group chat");
      return;
    }

    if (selectedUsers.length === 0) {
      message.warning("Please select at least one user for the group chat");
      return;
    }

    try {
      setCreating(true);

      // Create a new conversation
      const timestamp = new Date().toISOString();

      // Try with the auto-generated mutation and adding a type field
      const newConversationData = await client.graphql({
        query: mutations.createConversation,
        variables: {
          input: {
            lastMessageAt: timestamp,
            type: "GROUP" // Add type field which might be required
          }
        },
      });

      const newConversationId = newConversationData.data.createConversation.id;

      // Update the conversation with additional fields
      await client.graphql({
        query: mutations.updateConversation,
        variables: {
          input: {
            id: newConversationId,
            lastMessageContent: "Group chat created",
            lastMessageSenderId: currentUser.id,
          }
        },
      });

      // Add current user to the conversation
      await client.graphql({
        query: mutations.createUserConversation,
        variables: {
          input: {
            userId: currentUser.id,
            conversationId: newConversationId,
          }
        },
      });

      // Add all selected users to the conversation
      await Promise.all(
        selectedUsers.map(user =>
          client.graphql({
            query: mutations.createUserConversation,
            variables: {
              input: {
                userId: user.id,
                conversationId: newConversationId,
              }
            },
          })
        )
      );

      // Create initial message
      await client.graphql({
        query: mutations.createMessage,
        variables: {
          input: {
            conversationId: newConversationId,
            senderId: currentUser.id,
            content: "Group chat created",
            timestamp,
            read: false,
          }
        },
      });

      message.success("Group chat created successfully!");
      onClose();

      // Navigate to the new conversation
      navigate(`/messenger/${newConversationId}`);

    } catch (error) {
      console.error("Error creating group chat:", error);
      console.log("Detailed error:", JSON.stringify(error, null, 2));
      message.error("Failed to create group chat");
    } finally {
      setCreating(false);
    }
  };

  const getAvatar = (avatarName) => {
    return avatarName ? selectAvatar(avatarName) : null;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Group Chat</h2>

        {/* Selected users display */}
        {selectedUsers.length > 0 && (
          <div className="selected-users">
            {selectedUsers.map(user => (
              <Tag
                key={user.id}
                closable
                onClose={() => removeSelectedUser(user)}
                className="selected-user-tag"
              >
                {user.nickname || "User"}
              </Tag>
            ))}
          </div>
        )}

        {/* Search input */}
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearch}
          className="user-search-input"
        />

        {/* User list */}
        <div className="user-list">
          {loading ? (
            <div className="loading-container">
              <Spin />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-users">No users found</div>
          ) : (
            <List
              dataSource={filteredUsers}
              renderItem={(user) => (
                <List.Item
                  key={user.id}
                  className={`user-item ${selectedUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={40}
                        src={getAvatar(user.avatar)}
                        icon={!user.avatar && <UserOutlined />}
                      />
                    }
                    title={user.nickname || "User"}
                    description={user.email || ""}
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="modal-actions">
          <Button
            type="primary"
            onClick={handleCreateGroupChat}
            loading={creating}
            disabled={selectedUsers.length === 0}
          >
            Create Group Chat
          </Button>
          <Button onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChatModal;
