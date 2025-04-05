import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Input, Avatar, Button, List, Tag, Spin, message, Modal, Divider } from 'antd';
import { UserOutlined, SearchOutlined, CloseOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import { selectAvatar } from '../../functions';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const client = generateClient();

const EditGroupChatModal = ({
  isOpen,
  onClose,
  conversationName,
  conversation,
  currentUser,
  onGroupUpdated,
  onGroupDeleted,
  setConversations,
  selectedConversation,
  setSelectedConversation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [participants, setParticipants] = useState([]);

  const navigate = useNavigate();

  // Log conversation data when the modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened with conversation data:", conversation);
      console.log("Current user:", currentUser);
    }
  }, [isOpen, conversation, currentUser]);

  // Initialize group name and participants when the modal opens or conversation changes
  useEffect(() => {
    if (isOpen && conversation) {
      // Ensure group name is set to the current conversation name
      const currentName = conversation.name || '';
      console.log("Setting group name to:", currentName);
      setGroupName(currentName);

      if (conversation.participants && conversation.participants.items) {
        console.log("Participants:", conversation.participants.items);
        const participantUsers = conversation.participants.items
          .filter(item => item.userId !== currentUser?.id)
          .map(item => item.user);

        setParticipants(participantUsers);
        setSelectedUsers(participantUsers);
      }
    }
  }, [isOpen, conversation, currentUser]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setFilteredUsers([]);
    }
  }, [isOpen]);

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
          limit: 100
        }
      });

      console.log("User data response:", userData);

      if (!userData.data || !userData.data.listUsers || !userData.data.listUsers.items) {
        console.error("Invalid response format for listUsers");
        setLoading(false);
        return;
      }

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

      const timestamp = new Date().toISOString();
      let changeMessage = "Group updated";

      if (groupName !== conversation.name) {
        changeMessage = `Group name changed to "${groupName}"`;
        await client.graphql({
          query: mutations.updateConversation,
          variables: {
            input: {
              id: conversation.id,
              name: groupName,
            }
          },
        });
        console.log("Group name updated successfully");

        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === conversation.id ? { ...conv, name: groupName } : conv
          )
        );

        if (selectedConversation && selectedConversation.id === conversation.id) {
          setSelectedConversation({ ...selectedConversation, name: groupName });
        }
      }

      const currentParticipantIds = conversation.participants.items.map(item => item.userId);
      const usersToAdd = selectedUsers.filter(user => !currentParticipantIds.includes(user.id));
      const userConversationsToRemove = conversation.participants.items.filter(item =>
        item.userId !== currentUser.id && !selectedUsers.some(user => user.id === item.userId)
      );

      if (usersToAdd.length > 0) {
        for (const user of usersToAdd) {
          await client.graphql({
            query: mutations.createUserConversation,
            variables: {
              input: {
                userId: user.id,
                conversationId: conversation.id,
              }
            },
          });
        }
      }

      if (userConversationsToRemove.length > 0) {
        for (const item of userConversationsToRemove) {
          await client.graphql({
            query: mutations.deleteUserConversation,
            variables: {
              input: {
                id: item.id
              }
            },
          });
        }
      }

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

      message.success("Group chat updated successfully!");

      if (onGroupUpdated) {
        onGroupUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Error updating group chat:", error);
      message.error("Failed to update group chat");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = () => {
    console.log("Delete button clicked");
    console.log("Current conversation:", conversation);

    // Create a simpler confirmation dialog
    if (window.confirm('Are you sure you want to delete this group chat? This action cannot be undone. All messages will be permanently deleted.')) {
      console.log("User confirmed deletion");
      deleteGroupChat();
    } else {
      console.log("User cancelled deletion");
    }
  };

  const deleteGroupChat = async () => {
    console.log("deleteGroupChat function called");
    console.log("Conversation data:", conversation);

    if (!conversation || !conversation.id) {
      message.error("Invalid conversation data");
      return;
    }

    try {
      setDeleting(true);
      console.log("Deleting group chat with ID:", conversation.id);

      // Store the ID before deletion for reference
      const conversationId = conversation.id;

      // Delete all participants
      if (conversation.participants && conversation.participants.items) {
        console.log("Deleting participants:", conversation.participants.items.length);
        for (const participant of conversation.participants.items) {
          await client.graphql({
            query: mutations.deleteUserConversation,
            variables: { input: { id: participant.id } },
          });
        }
      }

      // Delete all messages in the conversation
      const messagesData = await client.graphql({
        query: queries.listMessages,
        variables: {
          filter: { conversationId: { eq: conversationId } },
          limit: 1000,
        },
      });

      if (messagesData.data && messagesData.data.listMessages && messagesData.data.listMessages.items) {
        console.log("Deleting messages:", messagesData.data.listMessages.items.length);
        for (const msg of messagesData.data.listMessages.items) {
          await client.graphql({
            query: mutations.deleteMessage,
            variables: { input: { id: msg.id } },
          });
        }
      }

      // Delete the conversation itself
      console.log("Deleting conversation:", conversationId);
      await client.graphql({
        query: mutations.deleteConversation,
        variables: { input: { id: conversationId } },
      });

      message.success("Group chat deleted successfully");

      // Close the modal first to prevent any state issues
      onClose();

      // Then call the onGroupDeleted callback
      if (onGroupDeleted) {
        console.log("Calling onGroupDeleted with ID:", conversationId);
        onGroupDeleted(conversationId);
      } else {
        console.warn("onGroupDeleted callback is not defined");
      }
    } catch (error) {
      console.error("Error deleting group chat:", error);
      message.error("Failed to delete group chat");
    } finally {
      setDeleting(false);
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

        <div className="group-name-input">
          <label>Group Name</label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="group-name-field"
          />
        </div>

        <Divider orientation="left">Group Members</Divider>

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

        <Input
          prefix={<SearchOutlined />}
          placeholder="Search users to add..."
          value={searchQuery}
          onChange={handleSearch}
          className="user-search-input"
        />

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

        <Divider />

        <div className="modal-actions">
          <div className="left-actions">
            <Button
              danger
              type="primary"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                // Prevent event propagation
                e.stopPropagation();
                console.log("Delete button clicked with event prevention");
                handleDeleteGroup();
              }}
              loading={deleting}
            >
              Delete Group
            </Button>
          </div>
          <div className="right-actions">
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
    </div>
  );
};

export default EditGroupChatModal;