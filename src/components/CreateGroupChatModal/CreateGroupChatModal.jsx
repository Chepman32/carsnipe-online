import React, { useState, useEffect } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import { Input, Avatar, Button, List, Tag, Spin, message } from 'antd';
import { UserOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { supabase } from '../../supabase';
import * as api from '../../api/supabaseApi';
import { selectAvatar } from '../../functions';

const CreateGroupChatModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
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
        // Try to get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.id) {
          console.log("Found user info in localStorage:", userInfo);

          // Fetch the full user data from the API to ensure we have all fields
          try {
            const userData = await api.getUser(userInfo.id);
            if (userData) {
              console.log("Fetched current user data:", userData);
              setCurrentUser(userData);
            } else {
              console.log("Using localStorage user info as fallback");
              setCurrentUser(userInfo);
            }
          } catch (err) {
            console.error("Error fetching user data from API:", err);
            // Fall back to the localStorage data
            setCurrentUser(userInfo);
          }
        } else {
          // Try to get user info from playerInfo as a fallback
          const playerInfo = JSON.parse(localStorage.getItem('playerInfo'));
          if (playerInfo && playerInfo.id) {
            console.log("Found player info in localStorage:", playerInfo);
            setCurrentUser(playerInfo);
          } else {
            console.error("No user info found in localStorage");
          }
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
    if (!currentUser) {
      console.log("No current user, skipping user fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching users with current user ID:", currentUser.id);

      const userData = await api.listUsers({}, 100, 0);

      console.log("User data response:", userData);

      if (!userData || !Array.isArray(userData)) {
        console.error("Invalid response format for listUsers");
        setLoading(false);
        return;
      }

      // Filter out the current user from the list
      const otherUsers = userData.filter(
        user => user.id !== currentUser.id
      );

      console.log("Filtered users:", otherUsers);
      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
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
      console.log("Creating group chat with users:", selectedUsers);
      console.log("Current user:", currentUser);

      // Create a new conversation
      const timestamp = new Date().toISOString();

      // Use custom group name if provided, otherwise generate one
      let displayGroupName = '';
      if (groupName.trim() !== '') {
        displayGroupName = groupName.trim();
      } else {
        // Create a group name using the participants' names
        if (selectedUsers.length <= 3) {
          // If 3 or fewer users, include all names
          const userNames = selectedUsers.map(user => user.nickname || 'User');
          // Add current user's name if available
          const allNames = currentUser?.nickname ?
            [currentUser.nickname, ...userNames] :
            ['You', ...userNames];
          displayGroupName = allNames.join(', ');
        } else {
          // If more than 3 users, include first 2 names and show count of others
          const userNames = selectedUsers.slice(0, 2).map(user => user.nickname || 'User');
          const currentUserName = currentUser?.nickname || 'You';
          const othersCount = selectedUsers.length - 2;
          displayGroupName = `${userNames.join(', ')} and ${othersCount} others`;
        }
      }

      console.log("Creating conversation with timestamp:", timestamp);

      // Create the conversation with minimal required fields
      try {
        const newConversationData = await api.createConversation({
          name: displayGroupName,
          lastMessageAt: timestamp,
          lastMessageContent: `${displayGroupName} created`,
          lastMessageSenderId: currentUser.id,
          isGroup: true
        });

        console.log("Conversation created:", newConversationData);
        const newConversationId = newConversationData.id;

        // Conversation already created with all required fields
        console.log("Conversation created with all info");

          // Add current user to the conversation
          try {
            console.log("Adding current user to conversation:", currentUser.id);
            await api.createUserConversation(currentUser.id, newConversationId);

            console.log("Current user added to conversation");

            // Add all selected users to the conversation - do this one at a time
            let addedUsers = 0;
            for (const user of selectedUsers) {
              console.log("Adding user to conversation:", user.id);
              try {
                await api.createUserConversation(user.id, newConversationId);
                addedUsers++;
                console.log(`User ${user.id} added to conversation (${addedUsers}/${selectedUsers.length})`);
              } catch (err) {
                console.error(`Error adding user ${user.id} to conversation:`, err);
                // Continue with other users even if one fails
              }
            }

            // Create initial message
            try {
              console.log("Creating initial message");
              await api.createMessage({
                conversationId: newConversationId,
                senderId: currentUser.id,
                content: `${displayGroupName} created`,
                timestamp,
                read: false,
                isEvent: true
              });

              console.log("Initial message created");
              message.success(`${displayGroupName} created successfully!`);
              onClose();

              // Navigate to the new conversation
              navigate(`/messenger/${newConversationId}`);
            } catch (err) {
              console.error("Error creating initial message:", err);
              console.log("Error details:", JSON.stringify(err, null, 2));

              // Still consider it a success if only the message creation failed
              message.success(`${displayGroupName} created, but initial message failed`);
              onClose();
              navigate(`/messenger/${newConversationId}`);
            }
          } catch (err) {
            console.error("Error adding current user to conversation:", err);
            console.log("Error details:", JSON.stringify(err, null, 2));
            message.error("Failed to add you to the group chat");
          }
      } catch (err) {
        console.error("Error creating conversation:", err);
        console.log("Error details:", JSON.stringify(err, null, 2));
        message.error("Failed to create group chat");
      }
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

        {/* Group name input */}
        <div className="group-name-input">
          <label>Group Name</label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name (optional)"
            className="group-name-field"
          />
        </div>

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
