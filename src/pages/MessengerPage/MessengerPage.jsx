import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Typography,
  List,
  Avatar,
  Input,
  Button,
  Spin,
  Empty,
  Divider,
  Badge,
  message,
} from "antd";
import { SendOutlined, UserOutlined, PlusOutlined } from "@ant-design/icons";
import { generateClient } from 'aws-amplify/api';
import { useParams, useNavigate } from "react-router-dom";
import CreateGroupChatModal from '../../components/CreateGroupChatModal/CreateGroupChatModal';
import EditGroupChatModal from '../../components/EditGroupChatModal/EditGroupChatModal';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import { fetchAuctionUser, fetchUserInfoById, selectAvatar } from "../../functions";
import "./MessengerPage.css";

// Custom queries with expanded user data
const customQueries = {
  getConversation: /* GraphQL */ `
    query GetConversation($id: ID!) {
      getConversation(id: $id) {
        id
        participants {
          items {
            user {
              id
              nickname
              avatar
            }
            userId
            conversationId
          }
        }
        messages {
          items {
            id
            conversationId
            senderId
            content
            timestamp
            read
          }
        }
        lastMessageAt
        lastMessageContent
        lastMessageSenderId
        createdAt
        updatedAt
      }
    }
  `,
  userConversationsByUserId: /* GraphQL */ `
    query UserConversationsByUserId(
      $userId: ID!
      $sortDirection: ModelSortDirection
      $filter: ModelUserConversationFilterInput
      $limit: Int
      $nextToken: String
    ) {
      userConversationsByUserId(
        userId: $userId
        sortDirection: $sortDirection
        filter: $filter
        limit: $limit
        nextToken: $nextToken
      ) {
        items {
          id
          userId
          conversationId
          user {
            id
            nickname
            avatar
          }
          conversation {
            id
            lastMessageAt
            lastMessageContent
            lastMessageSenderId
          }
        }
        nextToken
      }
    }
  `,
  messagesByConversationId: /* GraphQL */ `
    query MessagesByConversationId(
      $conversationId: ID!
      $sortDirection: ModelSortDirection
      $filter: ModelMessageFilterInput
      $limit: Int
      $nextToken: String
    ) {
      messagesByConversationId(
        conversationId: $conversationId
        sortDirection: $sortDirection
        filter: $filter
        limit: $limit
        nextToken: $nextToken
      ) {
        items {
          id
          conversationId
          senderId
          content
          timestamp
          read
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
    }
  `,
  getConversationWithParticipants: /* GraphQL */ `
    query GetConversation($id: ID!) {
      getConversation(id: $id) {
        id
        participants {
          items {
            id
            userId
            user {
              id
              nickname
              avatar
              __typename
            }
            __typename
          }
        }
        lastMessageAt
        lastMessageContent
        lastMessageSenderId
        createdAt
        updatedAt
        __typename
      }
    }
  `
};

// Use the custom queries and auto-generated queries/mutations
const { listMessages, getUser, userConversationsByConversationId } = queries;
const {
  getConversation,
  userConversationsByUserId,
  messagesByConversationId: messagesByConversationIdCustom,
  getConversationWithParticipants
} = customQueries;

const {
  createConversation,
  updateConversation,
  createUserConversation,
  createMessage,
  updateMessage
} = mutations;

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const client = generateClient();

const MessengerPage = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isCreateGroupChatModalOpen, setIsCreateGroupChatModalOpen] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isEditGroupChatModalOpen, setIsEditGroupChatModalOpen] = useState(false);

  // Add a useEffect to log when the modal state changes
  useEffect(() => {
    console.log("Edit group chat modal state changed:", isEditGroupChatModalOpen);
  }, [isEditGroupChatModalOpen]);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { conversationId } = useParams();
  const navigate = useNavigate();

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.id) {
          const userData = await fetchUserInfoById(userInfo.id);
          if (userData) {
            setCurrentUser(userData);
            console.log("Current user loaded:", userData);
          } else {
            console.error("User data not found");
            message.error("User information not found");
          }
        } else {
          // Try to get user info from the App component's state
          const appUserInfo = JSON.parse(localStorage.getItem('playerInfo'));
          if (appUserInfo && appUserInfo.id) {
            const userData = await fetchUserInfoById(appUserInfo.id);
            if (userData) {
              setCurrentUser(userData);
              console.log("Current user loaded from playerInfo:", userData);
            }
          } else {
            console.error("No user info found in localStorage");
            message.error("Please log in to view conversations");
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        message.error("Failed to load user information");
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch user conversations - only when currentUser changes
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) {
        console.log("No current user, skipping conversation fetch");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching conversations for user:", currentUser.id);

        // Get all conversations where the current user is a participant
        const userConversationsData = await client.graphql({
          query: userConversationsByUserId,
          variables: {
            userId: currentUser.id,
          },
        });

        console.log("User conversations data:", userConversationsData);

        if (!userConversationsData.data || !userConversationsData.data.userConversationsByUserId) {
          console.error("Invalid response format for userConversationsByUserId");
          message.error("Failed to load conversations: Invalid response format");
          setLoading(false);
          return;
        }

        const userConversationItems = userConversationsData.data.userConversationsByUserId.items;
        console.log("User conversation items:", userConversationItems);

        if (userConversationItems.length === 0) {
          console.log("No conversations found for user");
          setConversations([]);
          setLoading(false);
          return;
        }

        // Fetch full conversation details for each conversation
        const conversationPromises = userConversationItems.map(async (item) => {
          try {
            console.log("Fetching conversation details for:", item.conversationId);
            const conversationData = await client.graphql({
              query: getConversation,
              variables: {
                id: item.conversationId,
              },
            });

            if (!conversationData.data || !conversationData.data.getConversation) {
              console.error("Invalid response format for getConversation", item.conversationId);
              return null;
            }

            return conversationData.data.getConversation;
          } catch (err) {
            console.error("Error fetching conversation details:", err);
            return null;
          }
        });

        const fetchedConversations = await Promise.all(conversationPromises);
        const validConversations = fetchedConversations.filter(conv => conv !== null);

        console.log("Fetched conversations:", validConversations);

        // Sort conversations by last message timestamp (newest first)
        const sortedConversations = validConversations.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || 0);
          const timeB = new Date(b.lastMessageAt || 0);
          return timeB - timeA;
        });

        setConversations(sortedConversations);

        // If there's a conversationId in the URL, select that conversation
        if (conversationId) {
          const selectedConv = sortedConversations.find(conv => conv.id === conversationId);
          if (selectedConv) {
            setSelectedConversation(selectedConv);
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        message.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser]); // Removed conversationId from dependencies to prevent refetching when switching chats

  // Handle URL conversationId changes without refetching all conversations
  useEffect(() => {
    if (!conversationId || !conversations.length) return;

    const selectedConv = conversations.find(conv => conv.id === conversationId);
    if (selectedConv) {
      setSelectedConversation(selectedConv);
    }
  }, [conversationId, conversations]);

  // Focus the message input when a conversation is selected
  useEffect(() => {
    if (selectedConversation && messageInputRef.current) {
      // Use a small timeout to ensure the DOM is ready
      setTimeout(() => {
        messageInputRef.current.focus();
      }, 100);
    }
  }, [selectedConversation]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !currentUser) {
        console.log("No selected conversation or current user, skipping message fetch");
        return;
      }

      try {
        console.log("Fetching messages for conversation:", selectedConversation.id);
        setMessages([]); // Clear messages while loading

        // Get all messages for the selected conversation using listMessages with a filter
        const messagesData = await client.graphql({
          query: listMessages,
          variables: {
            filter: {
              conversationId: {
                eq: selectedConversation.id
              }
            },
            limit: 100, // Adjust as needed
            sortDirection: "ASC", // Oldest to newest
          },
        });

        console.log("Messages data response:", messagesData);

        if (!messagesData.data || !messagesData.data.listMessages) {
          console.error("Invalid response format for listMessages");
          console.log("Messages data response details:", JSON.stringify(messagesData, null, 2));
          throw new Error("Failed to get messages for this conversation");
        }

        const fetchedMessages = messagesData.data.listMessages.items || [];
        console.log("Fetched messages:", fetchedMessages);

        // Check if this is a group chat (more than 2 participants)
        if (selectedConversation.participants && selectedConversation.participants.items) {
          const participants = selectedConversation.participants.items;

          if (participants.length > 2) {
            // This is a group chat - set otherUser to a special group object
            const otherParticipants = participants.filter(
              item => item.user.id !== currentUser.id
            );

            setOtherUser({
              id: 'group',
              nickname: selectedConversation.name || `Group Chat (${participants.length})`,
              isGroup: true,
              participants: participants
            });
          } else {
            // This is a one-on-one chat - find the other user
            const otherParticipant = participants.find(
              item => item.user.id !== currentUser.id
            );

            if (otherParticipant) {
              // First try to use the user data directly from the conversation
              if (otherParticipant.user && otherParticipant.user.avatar) {
                setOtherUser(otherParticipant.user);
              } else {
                // Fallback to fetching user info if needed
                const otherUserData = await fetchUserInfoById(otherParticipant.user.id);
                setOtherUser(otherUserData);
              }
            }
          }
        }

        if (fetchedMessages.length === 0) {
          console.log("No messages found for this conversation");
          setMessages([]);
          return;
        }

        // Sort messages by timestamp to ensure they're in chronological order
        const sortedMessages = fetchedMessages.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0);
          const timeB = new Date(b.timestamp || 0);
          return timeA - timeB;
        });

        setMessages(sortedMessages);

        // Mark unread messages as read
        const unreadMessages = fetchedMessages.filter(
          msg => !msg.read && msg.senderId !== currentUser.id
        );

        if (unreadMessages.length > 0) {
          console.log("Marking messages as read:", unreadMessages.length);
          await Promise.all(
            unreadMessages.map(msg =>
              client.graphql({
                query: updateMessage,
                variables: {
                  input: {
                    id: msg.id,
                    read: true,
                  },
                },
              })
            )
          );
        }

        // Check if we need to update the conversation in the list with latest message info
        const latestMessage = fetchedMessages[fetchedMessages.length - 1];
        if (latestMessage) {
          // Update the conversations list using functional update to avoid dependency on conversations
          setConversations(prevConversations => {
            // Get the current conversation from the list
            const currentConvInList = prevConversations.find(c => c.id === selectedConversation.id);

            // If the latest message is newer than what we have in the conversation list, update it
            if (currentConvInList &&
                (!currentConvInList.lastMessageAt ||
                 new Date(latestMessage.timestamp) > new Date(currentConvInList.lastMessageAt))) {

              // Update the conversations list to reflect the latest message
              const updatedConversations = prevConversations.map(conv => {
                if (conv.id === selectedConversation.id) {
                  return {
                    ...conv,
                    lastMessageAt: latestMessage.timestamp,
                    lastMessageContent: latestMessage.content,
                    lastMessageSenderId: latestMessage.senderId
                  };
                }
                return conv;
              });

              // Sort conversations by last message timestamp (newest first)
              return updatedConversations.sort((a, b) => {
                const timeA = new Date(a.lastMessageAt || 0);
                const timeB = new Date(b.lastMessageAt || 0);
                return timeB - timeA;
              });
            }

            // If no update needed, return the original list
            return prevConversations;
          });
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        console.log("Error details:", JSON.stringify(error, null, 2));
        message.error(`Failed to load messages: ${error.message || "Unknown error"}`);
      }
    };

    fetchMessages();

    // Set up polling for new messages - only poll for new messages, not the whole conversation
    const intervalId = setInterval(async () => {
      if (!selectedConversation || !currentUser) return;

      try {
        // Only fetch new messages
        const messagesData = await client.graphql({
          query: messagesByConversationIdCustom,
          variables: {
            conversationId: selectedConversation.id,
            limit: 100,
            sortDirection: "ASC",
          },
        });

        if (messagesData.data && messagesData.data.messagesByConversationId) {
          const fetchedMessages = messagesData.data.messagesByConversationId.items || [];

          // Only update if we have more messages than before
          if (fetchedMessages.length > messages.length) {
            console.log("New messages detected, updating...");

            // Sort messages by timestamp
            const sortedMessages = fetchedMessages.sort((a, b) => {
              const timeA = new Date(a.timestamp || 0);
              const timeB = new Date(b.timestamp || 0);
              return timeA - timeB;
            });

            setMessages(sortedMessages);

            // Mark new unread messages as read
            const unreadMessages = fetchedMessages.filter(
              msg => !msg.read && msg.senderId !== currentUser.id
            );

            if (unreadMessages.length > 0) {
              console.log("Marking new messages as read:", unreadMessages.length);
              await Promise.all(
                unreadMessages.map(msg =>
                  client.graphql({
                    query: updateMessage,
                    variables: {
                      input: {
                        id: msg.id,
                        read: true,
                      },
                    },
                  })
                )
              );
            }
          }
        }
      } catch (error) {
        console.error("Error polling for new messages:", error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedConversation, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      setSendingMessage(true);

      const timestamp = new Date().toISOString();

      console.log("Sending message to conversation:", selectedConversation.id);

      // Create new message
      const newMessageData = await client.graphql({
        query: createMessage,
        variables: {
          input: {
            conversationId: selectedConversation.id,
            senderId: currentUser.id,
            content: newMessage,
            timestamp,
            read: false,
            conversationMessagesId: selectedConversation.id, // Add this field to properly link the message to the conversation
          },
        },
      });

      console.log("Message created:", newMessageData);

      // Update conversation with last message info
      await client.graphql({
        query: updateConversation,
        variables: {
          input: {
            id: selectedConversation.id,
            lastMessageAt: timestamp,
            lastMessageContent: newMessage,
            lastMessageSenderId: currentUser.id,
          },
        },
      });

      // Add new message to the list and sort by timestamp
      const createdMessage = newMessageData.data.createMessage;
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, createdMessage];
        // Sort messages by timestamp (oldest to newest)
        return updatedMessages.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0);
          const timeB = new Date(b.timestamp || 0);
          return timeA - timeB;
        });
      });

      // Update the local conversations list using functional update
      setConversations(prevConversations => {
        // Update the conversation with the new message info
        const updatedConversations = prevConversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              lastMessageAt: timestamp,
              lastMessageContent: newMessage,
              lastMessageSenderId: currentUser.id
            };
          }
          return conv;
        });

        // Sort conversations by last message timestamp (newest first)
        return updatedConversations.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || 0);
          const timeB = new Date(b.lastMessageAt || 0);
          return timeB - timeA;
        });
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleGroupUpdate = async () => {
    // Reload the conversation to get updated data
    if (selectedConversation) {
      try {
        const conversationData = await client.graphql({
          query: getConversationWithParticipants,
          variables: {
            id: selectedConversation.id,
          },
        });

        if (!conversationData.data || !conversationData.data.getConversation) {
          console.error("Invalid response format for getConversationWithParticipants");
          return;
        }

        const updatedConversation = conversationData.data.getConversation;
        setSelectedConversation(updatedConversation);

        // Update the conversations list
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv.id === updatedConversation.id) {
              return {
                ...conv,
                name: updatedConversation.name
              };
            }
            return conv;
          });
        });

        // Update otherUser info for group chats
        if (updatedConversation.participants?.items.length > 2) {
          const participants = updatedConversation.participants.items;
          setOtherUser({
            id: 'group',
            isGroup: true,
            nickname: updatedConversation.name || `Group (${participants.length})`,
            participants: participants
          });
        }
      } catch (error) {
        console.error('Error refreshing conversation:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`/messenger/${conversation.id}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getAvatar = (avatarName) => {
    return avatarName ? selectAvatar(avatarName) : null;
  }

  if (loading && !currentUser) {
    return <Spin size="large" fullscreen />;
  }

  return (
    <>
      <Layout className="messenger-layout">
        <Sider width={300} className="conversation-sider">
        <div className="conversations-header">
          <Title level={4} onClick={() => console.log("otherparticipant", otherUser)}>Messages</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateGroupChatModalOpen(true)}
          >
            Create Group
          </Button>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin />
          </div>
        ) : conversations.length === 0 ? (
          <Empty description="No conversations yet" />
        ) : (
          <List
            className="conversation-list"
            dataSource={conversations}
            renderItem={(conversation) => {
              const participants = conversation.participants?.items || [];
              const isGroup = participants.length > 2;
              const isSelected = selectedConversation?.id === conversation.id;

              // We can't check messages directly since we're not loading them all at once
              // Instead, rely on the lastMessageSenderId to determine if there might be unread messages
              const hasUnread = conversation.lastMessageSenderId !== currentUser.id;

              let displayName = "Chat";
              let avatarSrc = null;

              if (isGroup) {
                // For group chats, show the number of participants
                const otherParticipants = participants.filter(
                  item => item.user.id !== currentUser.id
                );
                // Use conversation name if available, otherwise show "Group Chat (n)"
                displayName = conversation.name || `Group Chat (${participants.length})`;
              } else {
                // For one-on-one chats, show the other user's name
                const otherParticipantItem = participants.find(
                  item => item.user.id !== currentUser.id
                );
                const otherParticipant = otherParticipantItem?.user;
                displayName = otherParticipant?.nickname || "User";
                avatarSrc = getAvatar(otherParticipant?.avatar);
              }

              return (
                <List.Item
                  className={`conversation-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectConversation(conversation)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={hasUnread} offset={[-5, 5]} color="red">
                        <Avatar
                          size={40}
                          src={isGroup ? null : avatarSrc}
                          icon={isGroup ? <UserOutlined /> : (!avatarSrc && <UserOutlined />)}
                          style={isGroup ? { backgroundColor: '#1890ff' } : {}}
                        >
                          {isGroup && 'G'}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <div className="conversation-title">
                        <Text strong>{displayName}</Text>
                        <Text className="conversation-time">
                          {formatTime(conversation.lastMessageAt)}
                        </Text>
                      </div>
                    }
                    description={
                      <Text
                        className="conversation-preview"
                        type={hasUnread ? "default" : "secondary"}
                        strong={hasUnread}
                      >
                        {conversation.lastMessageSenderId === currentUser.id ? "You: " : ""}
                        {conversation.lastMessageContent || "No messages yet"}
                      </Text>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Sider>

      <Layout className="message-layout">
        {selectedConversation ? (
          <>
            <div className="message-header">
              <div className="message-header-user">
                {otherUser?.isGroup ? (
                  // Group chat header
                  <Avatar
                    size={40}
                    style={{ backgroundColor: '#1890ff' }}
                    icon={<UserOutlined />}
                  >
                    G
                  </Avatar>
                ) : (
                  // One-on-one chat header
                  <Avatar
                    size={40}
                    src={selectAvatar(otherUser?.avatar)}
                    icon={!otherUser?.avatar && <UserOutlined />}
                  />
                )}
                <div className="message-header-info">
                  {otherUser?.isGroup ? (
                    <Text
                      strong
                      className="message-header-name group-name"
                      onClick={() => {
                        console.log("Opening edit group modal", {
                          selectedConversation,
                          otherUser,
                          isGroup: otherUser?.isGroup
                        });
                        setIsEditGroupChatModalOpen(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {otherUser.nickname}
                    </Text>
                  ) : (
                    <Text strong className="message-header-name">
                      {otherUser?.nickname || "User"}
                    </Text>
                  )}
                  {otherUser?.isGroup && (
                    <Text type="secondary" className="message-header-participants">
                      {otherUser.participants.length} participants
                    </Text>
                  )}
                </div>
              </div>
            </div>

            <Content className="message-content">
              {messages.length === 0 ? (
                <div className="empty-messages">
                  <Empty description="No messages yet" />
                  <Text type="secondary">Send a message to start the conversation</Text>
                </div>
              ) : (
                <div className="messages-container">
                  {messages.map((msg, index) => {
                    const isCurrentUser = msg.senderId === currentUser.id;
                    const showAvatar = index === 0 ||
                      messages[index - 1].senderId !== msg.senderId;

                    // Find sender info for all messages
                    let senderName = isCurrentUser ? "You" : (otherUser?.nickname || "User");
                    let senderAvatar = isCurrentUser ? selectAvatar(currentUser?.avatar) : selectAvatar(otherUser?.avatar);

                    if (otherUser?.isGroup && !isCurrentUser) {
                      // In group chats, find the sender from participants
                      const sender = otherUser.participants?.find(
                        p => {
                          // Handle both possible structures
                          if (p.user && p.user.id) {
                            return p.user.id === msg.senderId;
                          } else if (p.userId) {
                            return p.userId === msg.senderId;
                          }
                          return false;
                        }
                      );

                      if (sender) {
                        if (sender.user) {
                          senderName = sender.user.nickname || "User";
                          senderAvatar = selectAvatar(sender.user.avatar);
                        } else {
                          // Try to use the user directly if that's the structure
                          senderName = sender.nickname || "User";
                          senderAvatar = selectAvatar(sender.avatar);
                        }
                      }
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`message-bubble-container ${isCurrentUser ? 'sent' : 'received'}`}
                      >
                        <div className="message-content-wrapper">
                          {!isCurrentUser && showAvatar && (
                            <Avatar
                              size={32}
                              src={senderAvatar}
                              icon={!senderAvatar && <UserOutlined />}
                              className="message-avatar-left"
                            />
                          )}
                          <div className="message-bubble-wrapper">
                            {otherUser?.isGroup && !isCurrentUser && showAvatar && (
                              <Text className="message-sender-name" type="secondary">
                                {senderName}
                              </Text>
                            )}
                            <div className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}>
                              <Text className="message-text">{msg.content}</Text>
                            </div>
                            <Text className="message-time" type="secondary">
                              {formatTime(msg.timestamp)}
                            </Text>
                          </div>
                          {isCurrentUser && showAvatar && (
                            <Avatar
                              size={32}
                              src={senderAvatar}
                              icon={!senderAvatar && <UserOutlined />}
                              className="message-avatar-right"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </Content>

            <div className="message-input-container">
              <TextArea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                autoSize={{ minRows: 2, maxRows: 6 }}
                className="message-input"
                style={{ fontSize: '16px' }}
                autoFocus
              />
              <Button
                type="primary"
                icon={<SendOutlined style={{ fontSize: '20px' }} />}
                onClick={handleSendMessage}
                loading={sendingMessage}
                className="send-button"
              />
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <Empty
              description="Select a conversation or start a new one"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
        </Layout>
      </Layout>

      {/* Always render the modals but control visibility with isOpen prop - moved outside Layout */}
      <EditGroupChatModal
        isOpen={isEditGroupChatModalOpen && selectedConversation && otherUser?.isGroup}
        onClose={() => setIsEditGroupChatModalOpen(false)}
        conversation={selectedConversation || {}}
        currentUser={currentUser || {}}
        onGroupUpdated={handleGroupUpdate}
      />
      <CreateGroupChatModal
        isOpen={isCreateGroupChatModalOpen}
        onClose={() => setIsCreateGroupChatModalOpen(false)}
      />
    </>
  );
};

export default MessengerPage;
