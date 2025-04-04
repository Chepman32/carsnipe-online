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
  `
};

// Use the custom queries and auto-generated mutations
const { listMessages } = queries;
const { createConversation, updateConversation, createUserConversation, createMessage, updateMessage } = mutations;
const { getConversation, userConversationsByUserId } = customQueries;

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

  const messagesEndRef = useRef(null);
  const { conversationId } = useParams();
  const navigate = useNavigate();

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.id) {
          const userData = await fetchUserInfoById(userInfo.id);
          setCurrentUser(userData);
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
      if (!currentUser) return;

      try {
        setLoading(true);

        // Get all conversations where the current user is a participant
        const userConversationsData = await client.graphql({
          query: userConversationsByUserId,
          variables: {
            userId: currentUser.id,
          },
        });

        const userConversationItems = userConversationsData.data.userConversationsByUserId.items;

        // Fetch full conversation details for each conversation
        const conversationPromises = userConversationItems.map(async (item) => {
          const conversationData = await client.graphql({
            query: getConversation,
            variables: {
              id: item.conversationId,
            },
          });

          return conversationData.data.getConversation;
        });

        const fetchedConversations = await Promise.all(conversationPromises);

        // Sort conversations by last message timestamp (newest first)
        const sortedConversations = fetchedConversations.sort((a, b) => {
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
  }, [currentUser]); // Removed conversationId from dependencies

  // Handle URL conversationId changes without refetching all conversations
  useEffect(() => {
    if (!conversationId || !conversations.length) return;

    const selectedConv = conversations.find(conv => conv.id === conversationId);
    if (selectedConv) {
      setSelectedConversation(selectedConv);
    }
  }, [conversationId, conversations]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !currentUser) return;

      try {
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

        const fetchedMessages = messagesData.data.listMessages.items;
        setMessages(fetchedMessages);

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
              nickname: `Group (${otherParticipants.length + 1})`,
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

        // Mark unread messages as read
        const unreadMessages = fetchedMessages.filter(
          msg => !msg.read && msg.senderId !== currentUser.id
        );

        if (unreadMessages.length > 0) {
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
        message.error("Failed to load messages");
      }
    };

    fetchMessages();

    // Set up polling for new messages
    const intervalId = setInterval(fetchMessages, 5000);

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
          },
        },
      });

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

      // Add new message to the list
      const createdMessage = newMessageData.data.createMessage;
      setMessages([...messages, createdMessage]);

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
                displayName = participants.map(participant => participant.user.nickname).join('& ');
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
        <CreateGroupChatModal
          isOpen={isCreateGroupChatModalOpen}
          onClose={() => setIsCreateGroupChatModalOpen(false)}
        />
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
                    src={getAvatar(otherUser?.avatar)}
                    icon={!otherUser?.avatar && <UserOutlined />}
                  />
                )}
                <div className="message-header-info">
                  <Text strong className="message-header-name">
                    {otherUser?.isGroup ? otherUser.nickname : (otherUser?.nickname || "User")}
                  </Text>
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

                    // Find sender info for group chats
                    let senderName = isCurrentUser ? "You" : (otherUser?.nickname || "User");
                    let senderAvatar = isCurrentUser ? null : getAvatar(otherUser?.avatar);

                    if (otherUser?.isGroup && !isCurrentUser) {
                      // In group chats, find the sender from participants
                      const sender = otherUser.participants.find(
                        p => p.user.id === msg.senderId
                      )?.user;

                      if (sender) {
                        senderName = sender.nickname || "User";
                        senderAvatar = getAvatar(sender.avatar);
                      }
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`message-bubble-container ${isCurrentUser ? 'sent' : 'received'}`}
                      >
                        {!isCurrentUser && showAvatar && (
                          <Avatar
                            size={32}
                            src={senderAvatar}
                            icon={!senderAvatar && <UserOutlined />}
                            className="message-avatar"
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
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </Content>

            <div className="message-input-container">
              <TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                autoSize={{ minRows: 2, maxRows: 6 }}
                className="message-input"
                style={{ fontSize: '16px' }}
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
  );
};

export default MessengerPage;
