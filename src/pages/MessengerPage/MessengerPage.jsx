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
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { generateClient } from 'aws-amplify/api';
import { useParams, useNavigate } from "react-router-dom";
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import { fetchAuctionUser, fetchUserInfoById, selectAvatar } from "../../functions";
import "./MessengerPage.css";

// Use the auto-generated queries and mutations
const { getConversation, userConversationsByUserId, listMessages } = queries;
const { createConversation, updateConversation, createUserConversation, createMessage, updateMessage } = mutations;

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

  // Fetch user conversations
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
  }, [currentUser, conversationId]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

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

        // Fetch other user's info
        if (selectedConversation.participants && selectedConversation.participants.items) {
          const otherParticipant = selectedConversation.participants.items.find(
            item => item.user.id !== currentUser.id
          );

          if (otherParticipant) {
            const otherUserData = await fetchUserInfoById(otherParticipant.user.id);
            setOtherUser(otherUserData);
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

  const getAvatar = async () => {
        const auctionUser = await fetchAuctionUser(otherUser?.id);
        return auctionUser?.avatar ? selectAvatar(auctionUser.avatar) : null;
      }

  if (loading && !currentUser) {
    return <Spin size="large" fullscreen />;
  }

  return (
    <Layout className="messenger-layout">
      <Sider width={300} className="conversation-sider">
        <div className="conversations-header">
          <Title level={4}>Messages</Title>
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
              // Find the other user in this conversation
              const otherParticipantItem = conversation.participants?.items?.find(
                item => item.user.id !== currentUser.id
              );
              
              const otherParticipant = otherParticipantItem?.user;
              const isSelected = selectedConversation?.id === conversation.id;
              // We can't check messages directly since we're not loading them all at once
              // Instead, rely on the lastMessageSenderId to determine if there might be unread messages
              const hasUnread = conversation.lastMessageSenderId !== currentUser.id;
              
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
                          src={getAvatar()}
                          icon={!otherParticipant?.avatar && <UserOutlined />}
                        />
                      </Badge>
                    }
                    title={
                      <div className="conversation-title">
                        <Text strong>{otherParticipant?.nickname || "User"}</Text>
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
                <Avatar 
                  size={40} 
                  src={getAvatar()}
                  icon={!otherUser?.avatar && <UserOutlined />}
                />
                <div className="message-header-info">
                  <Text strong className="message-header-name">
                    {otherUser?.nickname || "User"}
                  </Text>
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
                    
                    return (
                      <div 
                        key={msg.id} 
                        className={`message-bubble-container ${isCurrentUser ? 'sent' : 'received'}`}
                      >
                        {!isCurrentUser && showAvatar && (
                          <Avatar 
                            size={32} 
                            src={getAvatar()}
                            icon={!otherUser?.avatar && <UserOutlined />}
                            className="message-avatar"
                          />
                        )}
                        <div className="message-bubble-wrapper">
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
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="message-input"
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
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