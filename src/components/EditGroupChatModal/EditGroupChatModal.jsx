import React, { useState, useEffect } from 'react';
import './styles.css';
import { generateClient } from 'aws-amplify/api';
import { Input, Avatar, Button, List, Tag, Spin, message } from 'antd';
import { UserOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import { selectAvatar } from '../../functions';

const client = generateClient();

const EditGroupChatModal = ({ isOpen, onClose, conversation, currentUser, onGroupUpdated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [participants, setParticipants] = useState([]);

  // Initialize group name and participants when conversation changes
  useEffect(() => {
    if (conversation && conversation.id) {
      setGroupName(conversation.name || '');
      
      if (conversation.participants && conversation.participants.items) {
        // Get all participants except the current user
        const participantUsers = conversation.participants.items
          .filter(item => item.userId !== currentUser.id)
          .map(item => item.user);
        
        setParticipants(participantUsers);
        setSelectedUsers(participantUsers);
      }
    }
  }, [conversation, currentUser]);

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
        query: queries.listUsers,
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

  const handleSaveChanges = async () => {
    if (!currentUser || !conversation || !conversation.id) {
      message.error("Cannot update group chat");
      return;
    }

    if (selectedUsers.length === 0) {
      message.warning("Please select at least one user for the group chat");
      return;
    }

    try {
      setSaving(true);
      console.log("Updating group chat:", conversation.id);
      console.log("Current user:", currentUser);
      console.log("Selected users:", selectedUsers);

      // Update conversation name if changed
      if (groupName !== conversation.name) {
        console.log(`Updating group name from "${conversation.name}" to "${groupName}"`);
        try {
          await client.graphql({
            query: mutations.updateConversation,
            variables: {
              input: {
                id: conversation.id,
                name: groupName || `Group Chat`,
              }
            },
          });
          console.log("Group name updated successfully");
        } catch (err) {
          console.error("Error updating group name:", err);
          console.log("Error details:", JSON.stringify(err, null, 2));
        }
      }

      // Get current participants
      const currentParticipantIds = conversation.participants.items.map(item => item.userId);
      console.log("Current participant IDs:", currentParticipantIds);

      // Find users to add (in selectedUsers but not in current participants)
      const usersToAdd = selectedUsers.filter(user =>
        !currentParticipantIds.includes(user.id)
      );
      console.log("Users to add:", usersToAdd);

      // Find users to remove (in current participants but not in selectedUsers)
      const userConversationsToRemove = conversation.participants.items.filter(item =>
        item.userId !== currentUser.id && // Don't remove current user
        !selectedUsers.some(user => user.id === item.userId)
      );
      console.log("User conversations to remove:", userConversationsToRemove);

      // Add new users to the conversation
      if (usersToAdd.length > 0) {
        console.log("Adding new users to conversation");
        for (const user of usersToAdd) {
          try {
            console.log(`Adding user ${user.id} to conversation`);
            await client.graphql({
              query: mutations.createUserConversation,
              variables: {
                input: {
                  userId: user.id,
                  conversationId: conversation.id,
                }
              },
            });
            console.log(`User ${user.id} added successfully`);
          } catch (err) {
            console.error(`Error adding user ${user.id} to conversation:`, err);
            console.log("Error details:", JSON.stringify(err, null, 2));
          }
        }
      }

      // Remove users from the conversation
      if (userConversationsToRemove.length > 0) {
        console.log("Removing users from conversation");
        for (const item of userConversationsToRemove) {
          try {
            console.log(`Removing user conversation ${item.id}`);
            await client.graphql({
              query: mutations.deleteUserConversation,
              variables: {
                input: {
                  id: item.id
                }
              },
            });
            console.log(`User conversation ${item.id} removed successfully`);
          } catch (err) {
            console.error(`Error removing user conversation ${item.id}:`, err);
            console.log("Error details:", JSON.stringify(err, null, 2));
          }
        }
      }

      // Create a system message about the changes
      const timestamp = new Date().toISOString();
      let changeMessage = "Group updated";

      if (groupName !== conversation.name) {
        changeMessage = `Group name changed to "${groupName}"`;
      } else if (usersToAdd.length > 0 || userConversationsToRemove.length > 0) {
        changeMessage = "Group members updated";
      }

      console.log("Creating system message about changes:", changeMessage);
      try {
        await client.graphql({
          query: mutations.createMessage,
          variables: {
            input: {
              conversationId: conversation.id,
              senderId: currentUser.id,
              content: changeMessage,
              timestamp,
              read: false,
            }
          },
        });
        console.log("System message created successfully");
      } catch (err) {
        console.error("Error creating system message:", err);
        console.log("Error details:", JSON.stringify(err, null, 2));
        // Continue even if message creation fails
      }

      // Update conversation with last message info
      try {
        console.log("Updating conversation with last message info");
        await client.graphql({
          query: mutations.updateConversation,
          variables: {
            input: {
              id: conversation.id,
              lastMessageAt: timestamp,
              lastMessageContent: changeMessage,
              lastMessageSenderId: currentUser.id,
            }
          },
        });
        console.log("Conversation updated with last message info");
      } catch (err) {
        console.error("Error updating conversation with last message info:", err);
        console.log("Error details:", JSON.stringify(err, null, 2));
      }

      message.success("Group chat updated successfully!");

      // Notify parent component to refresh conversation data
      if (onGroupUpdated) {
        console.log("Notifying parent component to refresh conversation data");
        onGroupUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Error updating group chat:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      message.error("Failed to update group chat");
    } finally {
      setSaving(false);
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
        <h2>Edit Group Chat</h2>

        {/* Group name input */}
        <div className="group-name-input">
          <label>Group Name</label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
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
          placeholder="Search users to add..."
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
            onClick={handleSaveChanges}
            loading={saving}
            disabled={selectedUsers.length === 0}
          >
            Save Changes
          </Button>
          <Button onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupChatModal;