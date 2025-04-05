import React, { useState, useEffect } from 'react';
import './styles.css';
import { generateClient } from 'aws-amplify/api';
import { useNavigate } from 'react-router-dom';
import { Input, Avatar, Button, List, Tag, Spin, message } from 'antd';
import { UserOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import { selectAvatar } from '../../functions';

// Extract the specific queries we need
const { getUser, listUsers } = queries;

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
        // Try to get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.id) {
          console.log("Found user info in localStorage:", userInfo);

          // Fetch the full user data from the API to ensure we have all fields
          try {
            const userData = await client.graphql({
              query: queries.getUser,
              variables: {
                id: userInfo.id,
              },
            });

            if (userData.data && userData.data.getUser) {
              console.log("Fetched current user data:", userData.data.getUser);
              setCurrentUser(userData.data.getUser);
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

      const userData = await client.graphql({
        query: listUsers,
        variables: {
          limit: 100 // Increase limit to get more users
        }
      });

      console.log("User data response:", userData);

      if (!userData.data || !userData.data.listUsers || !userData.data.listUsers.items) {
        console.error("Invalid response format for listUsers");
        setLoading(false);
        return;
      }

      // Filter out the current user from the list
      const otherUsers = userData.data.listUsers.items.filter(
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
      const groupName = `Group Chat (${selectedUsers.length + 1})`;

      console.log("Creating conversation with timestamp:", timestamp);

      // Create the conversation with minimal required fields
      // Note: The Conversation model doesn't have a name field in the schema
      try {
        const newConversationData = await client.graphql({
          query: mutations.createConversation,
          variables: {
            input: {
              // Create with empty object as the Conversation model doesn't require any fields
              // except the auto-generated ID
            }
          },
        });

        console.log("Conversation created:", newConversationData);
        const newConversationId = newConversationData.data.createConversation.id;

        // Update the conversation with additional fields
        try {
          await client.graphql({
            query: mutations.updateConversation,
            variables: {
              input: {
                id: newConversationId,
                lastMessageAt: timestamp,
                lastMessageContent: `${groupName} created`,
                lastMessageSenderId: currentUser.id,
              }
            },
          });

          console.log("Conversation updated with message info");

          // Add current user to the conversation
          try {
            console.log("Adding current user to conversation:", currentUser.id);
            await client.graphql({
              query: mutations.createUserConversation,
              variables: {
                input: {
                  userId: currentUser.id,
                  conversationId: newConversationId,
                }
              },
            });

            console.log("Current user added to conversation");

            // Add all selected users to the conversation - do this one at a time
            let addedUsers = 0;
            for (const user of selectedUsers) {
              console.log("Adding user to conversation:", user.id);
              try {
                await client.graphql({
                  query: mutations.createUserConversation,
                  variables: {
                    input: {
                      userId: user.id,
                      conversationId: newConversationId,
                    }
                  },
                });
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
              await client.graphql({
                query: mutations.createMessage,
                variables: {
                  input: {
                    conversationId: newConversationId,
                    senderId: currentUser.id,
                    content: `${groupName} created`,
                    timestamp,
                    read: false,
                    conversationMessagesId: newConversationId, // Add this field to properly link the message to the conversation
                  }
                },
              });

              console.log("Initial message created");
              message.success(`${groupName} created successfully!`);
              onClose();

              // Navigate to the new conversation
              navigate(`/messenger/${newConversationId}`);
            } catch (err) {
              console.error("Error creating initial message:", err);
              console.log("Error details:", JSON.stringify(err, null, 2));

              // Still consider it a success if only the message creation failed
              message.success(`${groupName} created, but initial message failed`);
              onClose();
              navigate(`/messenger/${newConversationId}`);
            }
          } catch (err) {
            console.error("Error adding current user to conversation:", err);
            console.log("Error details:", JSON.stringify(err, null, 2));
            message.error("Failed to add you to the group chat");
          }
        } catch (err) {
          console.error("Error updating conversation:", err);
          console.log("Error details:", JSON.stringify(err, null, 2));
          message.error("Failed to update group chat information");
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
