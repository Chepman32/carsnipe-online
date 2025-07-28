import React, { useState, useEffect } from 'react';
import { Input, Avatar, Button, List, Tag, Spin, message, Modal, Divider, Image } from 'antd';
import { UserOutlined, SearchOutlined, CloseOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { supabase } from '../../supabase';
import * as api from '../../api/supabaseApi';
import { selectAvatar } from '../../functions';
import { useNavigate } from 'react-router-dom';
import './styles.css';

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
  const [isDirectChat, setIsDirectChat] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [searchingMessages, setSearchingMessages] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

  const navigate = useNavigate();

  // Log conversation data when the modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened with conversation data:", conversation);
      console.log("Current user:", currentUser);

      // Determine if this is a direct chat or a group chat
      // A direct chat is one that was created as a direct message between two users
      // A group chat is one that was created as a group, regardless of the number of participants
      if (conversation?.participants?.items) {
        // A conversation is a group chat if:
        // 1. It has the isGroup flag set to true, OR
        // 2. It has a name (which means it was created as a group)
        // Note: The number of participants doesn't determine if it's a group chat
        const hasGroupName = conversation.name && conversation.name.trim() !== '';
        const isMarkedAsGroup = conversation.isGroup === true;

        // If the conversation has a name or is marked as a group, it's a group chat
        const isDirectChatConversation = !hasGroupName && !isMarkedAsGroup;
        setIsDirectChat(isDirectChatConversation);

        if (isDirectChatConversation) {
          // Find the other user in the conversation
          const otherParticipant = conversation.participants.items.find(
            item => item.userId !== currentUser?.id
          );

          if (otherParticipant && otherParticipant.user) {
            setOtherUser(otherParticipant.user);
          }
        }
      }
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
      setShowMessageSearch(false);
      setMessageSearchQuery('');
      setSearchResults([]);
      setImagePreviewVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentUser && !isDirectChat) {
      fetchUsers();
    }
  }, [isOpen, currentUser, isDirectChat]);

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
        await api.updateConversation(conversation.id, {
          name: groupName,
          isGroup: true // Explicitly mark as a group chat
        });
        console.log("Group name updated successfully");

        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === conversation.id ? { ...conv, name: groupName, isGroup: true } : conv
          )
        );

        if (selectedConversation && selectedConversation.id === conversation.id) {
          setSelectedConversation({ ...selectedConversation, name: groupName, isGroup: true });
        }
      }

      const currentParticipantIds = conversation.participants.items.map(item => item.userId);
      const usersToAdd = selectedUsers.filter(user => !currentParticipantIds.includes(user.id));
      const userConversationsToRemove = conversation.participants.items.filter(item =>
        item.userId !== currentUser.id && !selectedUsers.some(user => user.id === item.userId)
      );

      if (usersToAdd.length > 0) {
        for (const user of usersToAdd) {
          await api.createUserConversation(user.id, conversation.id);
        }
      }

      if (userConversationsToRemove.length > 0) {
        for (const item of userConversationsToRemove) {
          await api.deleteUserConversation(item.userId, conversation.id);
        }
      }

      await api.createMessage({
        conversationId: conversation.id,
        senderId: currentUser.id,
        content: changeMessage,
        timestamp,
        read: false,
        isEvent: true
      });

      await api.updateConversation(conversation.id, {
        lastMessageAt: timestamp,
        lastMessageContent: changeMessage,
        lastMessageSenderId: currentUser.id
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

  const handleDeleteChat = () => {
    console.log("Delete button clicked");
    console.log("Current conversation:", conversation);

    // Create a confirmation dialog
    const chatType = isDirectChat ? "conversation" : "group chat";
    if (window.confirm(`Are you sure you want to delete this ${chatType}? This action cannot be undone. All messages will be permanently deleted.`)) {
      console.log("User confirmed deletion");
      deleteChat();
    } else {
      console.log("User cancelled deletion");
    }
  };

  const deleteChat = async () => {
    console.log("deleteChat function called");
    console.log("Conversation data:", conversation);

    if (!conversation || !conversation.id) {
      message.error("Invalid conversation data");
      return;
    }

    try {
      setDeleting(true);
      console.log("Deleting chat with ID:", conversation.id);

      // Store the ID before deletion for reference
      const conversationId = conversation.id;

      // Delete all participants
      if (conversation.participants && conversation.participants.items) {
        console.log("Deleting participants:", conversation.participants.items.length);
        for (const participant of conversation.participants.items) {
          await api.deleteUserConversation(participant.userId, conversationId);
        }
      }

      // Delete all messages in the conversation
      const messagesData = await api.listMessages({ conversationId }, 1000, 0);

      if (messagesData && Array.isArray(messagesData)) {
        console.log("Deleting messages:", messagesData.length);
        for (const msg of messagesData) {
          await api.deleteMessage(msg.id);
        }
      }

      // Delete the conversation itself
      console.log("Deleting conversation:", conversationId);
      await api.deleteConversation(conversationId);

      const successMessage = isDirectChat ? "Conversation deleted successfully" : "Group chat deleted successfully";
      message.success(successMessage);

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
      console.error("Error deleting chat:", error);
      message.error("Failed to delete chat");
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchMessages = async () => {
    if (!messageSearchQuery.trim() || !conversation || !conversation.id) {
      return;
    }

    try {
      setSearchingMessages(true);
      console.log("Searching messages for:", messageSearchQuery);

      // Fetch all messages for the conversation
      const messagesData = await api.listMessages({ conversationId: conversation.id }, 1000, 0);

      if (messagesData && Array.isArray(messagesData)) {
        const allMessages = messagesData;
        console.log("Total messages:", allMessages.length);

        // Filter messages that contain the search query
        const matchingMessages = allMessages.filter(msg =>
          msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
        );

        console.log("Matching messages:", matchingMessages.length);
        setSearchResults(matchingMessages);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching messages:", error);
      message.error("Failed to search messages");
    } finally {
      setSearchingMessages(false);
    }
  };

  const getAvatar = (avatarName) => {
    return avatarName ? selectAvatar(avatarName) : null;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isDirectChat ? "Chat Options" : "Edit Group Chat"}</h2>

        {isDirectChat ? (
          <div className="direct-chat-header">
            <div className="user-avatar-container" onClick={() => setImagePreviewVisible(true)}>
              <Avatar
                size={80}
                src={getAvatar(otherUser?.avatar)}
                icon={!otherUser?.avatar && <UserOutlined />}
                className="user-avatar-large"
              />
              <div className="avatar-click-hint">Click to enlarge</div>
            </div>
            <h3>{otherUser?.nickname || "User"}</h3>
          </div>
        ) : (
          <>
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
          </>
        )}

        {isDirectChat && showMessageSearch && (
          <>
            <Divider orientation="left">Search Messages</Divider>
            <div className="message-search-container">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search in conversation..."
                value={messageSearchQuery}
                onChange={(e) => setMessageSearchQuery(e.target.value)}
                onPressEnter={handleSearchMessages}
                className="message-search-input"
              />
              <Button
                type="primary"
                onClick={handleSearchMessages}
                loading={searchingMessages}
              >
                Search
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="search-results">
                <List
                  dataSource={searchResults}
                  renderItem={(msg) => (
                    <List.Item key={msg.id} className="message-search-result">
                      <List.Item.Meta
                        title={`${msg.senderId === currentUser?.id ? 'You' : otherUser?.nickname || 'User'}`}
                        description={
                          <>
                            <div className="message-content">{msg.content}</div>
                            <div className="message-timestamp">{formatTime(msg.timestamp)}</div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : searchingMessages ? (
              <div className="loading-container">
                <Spin />
              </div>
            ) : messageSearchQuery && !searchingMessages ? (
              <div className="no-results">No matching messages found</div>
            ) : null}
          </>
        )}

        <Divider />

        <div className="modal-actions">
          <div className="left-actions">
            {isDirectChat ? (
              <>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => setShowMessageSearch(!showMessageSearch)}
                >
                  {showMessageSearch ? "Hide Search" : "Search Messages"}
                </Button>
                <Button
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteChat}
                  loading={deleting}
                >
                  Delete Conversation
                </Button>
              </>
            ) : (
              <Button
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={handleDeleteChat}
                loading={deleting}
              >
                Delete Group
              </Button>
            )}
          </div>
          <div className="right-actions">
            {!isDirectChat && (
              <Button
                type="primary"
                onClick={handleSaveChanges}
                loading={saving}
                disabled={selectedUsers.length === 0}
              >
                Save Changes
              </Button>
            )}
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Image preview modal */}
        {isDirectChat && (
          <Image
            width={200}
            style={{ display: 'none' }}
            src={getAvatar(otherUser?.avatar)}
            preview={{
              visible: imagePreviewVisible,
              src: getAvatar(otherUser?.avatar),
              onVisibleChange: (visible) => setImagePreviewVisible(visible),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EditGroupChatModal;