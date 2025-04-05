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

const customQueries = {
  getConversation: `
    query GetConversation($id: ID!) {
      getConversation(id: $id) {
        id
        name
        participants {
          items {
            id
            userId
            conversationId
            user {
              id
              nickname
              avatar
              __typename
            }
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
        }
        messages {
          items {
            id
            conversationId
            senderId
            content
            timestamp
            read
            createdAt
            updatedAt
            conversationMessagesId
            __typename
          }
          nextToken
          __typename
        }
        lastMessageAt
        lastMessageContent
        lastMessageSenderId
        createdAt
        updatedAt
        __typename
      }
    }
  `,
  userConversationsByUserId: `
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
          createdAt
          updatedAt
          __typename
        }
        nextToken
        __typename
      }
    }
  `,
  messagesByConversationId: `
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
  getConversationWithParticipants: `
    query GetConversation($id: ID!) {
      getConversation(id: $id) {
        id
        name
        participants {
          items {
            id
            userId
            conversationId
            user {
              id
              nickname
              avatar
              __typename
            }
            createdAt
            updatedAt
            __typename
          }
          nextToken
          __typename
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

  useEffect(() => {
    console.log("Edit group chat modal state changed:", isEditGroupChatModalOpen);
  }, [isEditGroupChatModalOpen]);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { conversationId } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) {
        console.log("No current user, skipping conversation fetch");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching conversations for user:", currentUser.id);
        console.log("Current user object:", JSON.stringify(currentUser, null, 2));

        console.log("Using listUserConversations with filter");

        const userConversationsData = await client.graphql({
          query: queries.listUserConversations,
          variables: {
            filter: {
              userId: {
                eq: currentUser.id
              }
            },
            limit: 100
          },
        });

        console.log("User conversations data:", JSON.stringify(userConversationsData, null, 2));

        if (!userConversationsData.data || !userConversationsData.data.listUserConversations) {
          console.error("Invalid response format for listUserConversations");
          console.error("Response data:", JSON.stringify(userConversationsData, null, 2));
          message.error("Failed to load conversations: Invalid response format");
          setLoading(false);
          return;
        }

        const userConversationItems = userConversationsData.data.listUserConversations.items;
        console.log("User conversation items:", JSON.stringify(userConversationItems, null, 2));
        console.log("Number of conversations found:", userConversationItems.length);

        if (userConversationItems.length === 0) {
          console.log("No conversations found for user");
          setConversations([]);
          setLoading(false);
          return;
        }

        const conversationPromises = userConversationItems.map(async (item) => {
          try {
            console.log("Fetching conversation details for:", item.conversationId);
            const conversationData = await client.graphql({
              query: queries.getConversation,
              variables: {
                id: item.conversationId,
              },
            });

            console.log("Conversation data for", item.conversationId, ":", JSON.stringify(conversationData, null, 2));

            if (!conversationData.data || !conversationData.data.getConversation) {
              console.error("Invalid response format for getConversation", item.conversationId);
              console.error("Response data:", JSON.stringify(conversationData, null, 2));
              return null;
            }

            const participantsData = await client.graphql({
              query: userConversationsByConversationId,
              variables: {
                conversationId: item.conversationId,
                limit: 50
              },
            });

            console.log("Participants data for", item.conversationId, ":",
              JSON.stringify(participantsData?.data?.userConversationsByConversationId?.items, null, 2));

            const participantPromises = participantsData?.data?.userConversationsByConversationId?.items.map(
              async (participant) => {
                try {
                  const userData = await client.graphql({
                    query: queries.getUser,
                    variables: {
                      id: participant.userId,
                    },
                  });

                  return {
                    ...participant,
                    user: userData.data.getUser
                  };
                } catch (err) {
                  console.error("Error fetching user details for", participant.userId, ":", err);
                  return participant;
                }
              }
            ) || [];

            const participantsWithUserDetails = await Promise.all(participantPromises);

            const conversationWithParticipants = {
              ...conversationData.data.getConversation,
              participants: {
                items: participantsWithUserDetails,
                nextToken: participantsData?.data?.userConversationsByConversationId?.nextToken,
                __typename: "ModelUserConversationConnection"
              }
            };

            return conversationWithParticipants;
          } catch (err) {
            console.error("Error fetching conversation details for", item.conversationId, ":", err);
            console.error("Error details:", JSON.stringify(err, null, 2));
            return null;
          }
        });

        const fetchedConversations = await Promise.all(conversationPromises);
        const validConversations = fetchedConversations.filter(conv => conv !== null);

        console.log("Fetched conversations:", JSON.stringify(validConversations, null, 2));
        console.log("Number of valid conversations:", validConversations.length);

        const sortedConversations = validConversations.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || 0);
          const timeB = new Date(b.lastMessageAt || 0);
          return timeB - timeA;
        });

        console.log("Sorted conversations:", JSON.stringify(sortedConversations, null, 2));
        console.log("Setting conversations state with", sortedConversations.length, "conversations");

        setConversations(sortedConversations);

        if (conversationId) {
          console.log("URL has conversationId:", conversationId);
          const selectedConv = sortedConversations.find(conv => conv.id === conversationId);
          if (selectedConv) {
            console.log("Found matching conversation for URL:", selectedConv.id);
            setSelectedConversation(selectedConv);
          } else {
            console.log("No matching conversation found for URL conversationId");
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        message.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser]);

  useEffect(() => {
    if (!conversationId || !conversations.length) return;

    const selectedConv = conversations.find(conv => conv.id === conversationId);
    if (selectedConv) {
      setSelectedConversation(selectedConv);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    if (selectedConversation && messageInputRef.current) {
      setTimeout(() => {
        messageInputRef.current.focus();
      }, 100);
    }
  }, [selectedConversation]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !currentUser) {
        console.log("No selected conversation or current user, skipping message fetch");
        return;
      }

      try {
        console.log("Fetching messages for conversation:", selectedConversation.id);
        console.log("Selected conversation data:", JSON.stringify(selectedConversation, null, 2));
        setMessages([]);

        const messagesData = await client.graphql({
          query: listMessages,
          variables: {
            filter: {
              conversationId: {
                eq: selectedConversation.id
              }
            },
            limit: 100,
            sortDirection: "ASC",
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

        if (selectedConversation.participants && selectedConversation.participants.items) {
          const participants = selectedConversation.participants.items;
          console.log("Conversation participants:", JSON.stringify(participants, null, 2));

          if (participants.length > 2) {
            const otherParticipants = participants.filter(
              item => item.userId !== currentUser.id
            );

            console.log("Other participants:", JSON.stringify(otherParticipants, null, 2));

            let groupName = '';
            if (otherParticipants.length <= 3) {
              const userNames = otherParticipants.map(item => {
                if (item.user && item.user.nickname) {
                  return item.user.nickname;
                }
                return 'User';
              });

              const allNames = currentUser?.nickname ?
                [currentUser.nickname, ...userNames] :
                ['You', ...userNames];
              groupName = allNames.join(', ');
            } else {
              const userNames = otherParticipants.slice(0, 2).map(item => {
                if (item.user && item.user.nickname) {
                  return item.user.nickname;
                }
                return 'User';
              });

              const currentUserName = currentUser?.nickname || 'You';
              const othersCount = otherParticipants.length - 2;
              groupName = `${userNames.join(', ')} and ${othersCount} others`;
            }

            console.log("Generated group name:", groupName);
            console.log("Conversation name from data:", selectedConversation.name);

            setOtherUser({
              id: 'group',
              nickname: (selectedConversation.name && selectedConversation.name.trim() !== '') ? selectedConversation.name : groupName,
              isGroup: true,
              participants: participants
            });
          } else {
            const otherParticipant = participants.find(
              item => item.userId !== currentUser.id
            );

            console.log("Other participant:", JSON.stringify(otherParticipant, null, 2));

            if (otherParticipant) {
              if (otherParticipant.user && otherParticipant.user.avatar) {
                setOtherUser(otherParticipant.user);
              } else {
                const otherUserData = await fetchUserInfoById(otherParticipant.userId);
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

        const sortedMessages = fetchedMessages.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0);
          const timeB = new Date(b.timestamp || 0);
          return timeA - timeB;
        });

        setMessages(sortedMessages);

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

        const latestMessage = fetchedMessages[fetchedMessages.length - 1];
        if (latestMessage) {
          setConversations(prevConversations => {
            const currentConvInList = prevConversations.find(c => c.id === selectedConversation.id);

            if (currentConvInList &&
                (!currentConvInList.lastMessageAt ||
                 new Date(latestMessage.timestamp) > new Date(currentConvInList.lastMessageAt))) {

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

              return updatedConversations.sort((a, b) => {
                const timeA = new Date(a.lastMessageAt || 0);
                const timeB = new Date(b.lastMessageAt || 0);
                return timeB - timeA;
              });
            }

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

    const intervalId = setInterval(async () => {
      if (!selectedConversation || !currentUser) return;

      try {
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

          if (fetchedMessages.length > messages.length) {
            console.log("New messages detected, updating...");

            const sortedMessages = fetchedMessages.sort((a, b) => {
              const timeA = new Date(a.timestamp || 0);
              const timeB = new Date(b.timestamp || 0);
              return timeA - timeB;
            });

            setMessages(sortedMessages);

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

      const newMessageData = await client.graphql({
        query: createMessage,
        variables: {
          input: {
            conversationId: selectedConversation.id,
            senderId: currentUser.id,
            content: newMessage,
            timestamp,
            read: false,
            conversationMessagesId: selectedConversation.id,
          },
        },
      });

      console.log("Message created:", newMessageData);

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

      const createdMessage = newMessageData.data.createMessage;
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, createdMessage];
        return updatedMessages.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0);
          const timeB = new Date(b.timestamp || 0);
          return timeA - timeB;
        });
      });

      setConversations(prevConversations => {
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
    if (!selectedConversation || !currentUser) return;

    try {
      console.log("Refreshing conversation data after group update");

      const conversationData = await client.graphql({
        query: getConversation,
        variables: { id: selectedConversation.id },
      });

      if (!conversationData.data || !conversationData.data.getConversation) {
        console.error("Failed to fetch updated conversation data");
        return;
      }

      const updatedConversation = conversationData.data.getConversation;

      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === updatedConversation.id ? updatedConversation : conv
        )
      );

      setSelectedConversation(updatedConversation);

      if (updatedConversation.participants?.items.length > 2) {
        const participants = updatedConversation.participants.items;
        const otherParticipants = participants.filter(item => item.userId !== currentUser.id);

        let groupName = updatedConversation.name && updatedConversation.name.trim() !== ''
          ? updatedConversation.name
          : otherParticipants.map(p => p.user?.nickname || "User").join(", ");

        setOtherUser({
          id: "group",
          isGroup: true,
          nickname: groupName,
          participants: participants,
        });
      }

      console.log("Group chat updated successfully:", updatedConversation);
      console.log("Updated conversations:", conversations);
      console.log("Updated selectedConversation:", updatedConversation);
      console.log("Updated otherUser:", { nickname: updatedConversation.name });
    } catch (error) {
      console.error("Error refreshing conversation:", error);
      message.error("Failed to refresh group chat data");
    }
  };

  const handleGroupDeleted = (deletedConversationId) => {
    console.log("Group deleted:", deletedConversationId);

    // Update conversations list by removing the deleted conversation
    setConversations(prevConversations =>
      prevConversations.filter(conv => conv.id !== deletedConversationId)
    );

    // If the deleted conversation was selected, clear all related state
    if (selectedConversation && selectedConversation.id === deletedConversationId) {
      setSelectedConversation(null);
      setMessages([]);
      setOtherUser(null);

      // Use setTimeout to ensure state updates are processed before navigation
      setTimeout(() => {
        navigate('/messenger');
      }, 0);
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
  };

  useEffect(() => {
    console.log("Rendering with conversations:", conversations.length);
    console.log("Conversations data:", JSON.stringify(conversations, null, 2));
    console.log("Loading state:", loading);
    console.log("Current user:", currentUser?.id);
  }, [conversations, loading, currentUser]);

  if (loading && !currentUser) {
    return <Spin size="large" fullscreen />;
  }

  console.log("About to render with:", {
    conversationsLength: conversations.length,
    loading,
    currentUser: currentUser?.id
  });

  return (
    <>
      <Layout className="messenger-layout">
        <Sider width={300} className="conversation-sider">
          <div className="conversations-header">
            <Title level={4} onClick={() => {
              console.log("Current conversations state:", conversations);
              console.log("Other user:", otherUser);
            }}>Messages</Title>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type="default"
                onClick={() => {
                  console.log("Debug button clicked");
                  console.log("Current user:", currentUser);
                  console.log("Conversations:", conversations);
                  console.log("Loading state:", loading);

                  if (currentUser) {
                    console.log("Refreshing conversations...");
                    client.graphql({
                      query: queries.listUserConversations,
                      variables: {
                        filter: {
                          userId: {
                            eq: currentUser.id
                          }
                        },
                        limit: 100
                      },
                    }).then(data => {
                      console.log("Refreshed user conversations data:", data);
                      if (data.data && data.data.listUserConversations && data.data.listUserConversations.items) {
                        console.log("Found conversations:", data.data.listUserConversations.items.length);

                        if (data.data.listUserConversations.items.length > 0) {
                          const firstConversation = data.data.listUserConversations.items[0];
                          console.log("Fetching details for first conversation:", firstConversation.conversationId);

                          client.graphql({
                            query: queries.getConversation,
                            variables: {
                              id: firstConversation.conversationId,
                            },
                          }).then(convData => {
                            console.log("First conversation details:", convData);
                          }).catch(err => {
                            console.error("Error fetching conversation details:", err);
                          });
                        }
                      }
                    }).catch(err => {
                      console.error("Error refreshing conversations:", err);
                    });
                  }
                }}
              >
                Debug
              </Button>
              <Button
                type="default"
                onClick={() => {
                  if (currentUser) {
                    setLoading(true);
                    setCurrentUser({...currentUser});
                    message.info("Refreshing conversations...");
                  }
                }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateGroupChatModalOpen(true)}
              >
                Create Group
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin />
            </div>
          ) : conversations.length === 0 ? (
            <>
              <Empty description="No conversations yet" />
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button
                  type="primary"
                  onClick={() => {
                    console.log("Debug button clicked");
                    console.log("Current user:", currentUser);
                    console.log("Conversations:", conversations);
                    console.log("Loading state:", loading);
                  }}
                >
                  Debug Info
                </Button>
              </div>
            </>
          ) : (
            <List
              className="conversation-list"
              dataSource={conversations}
              renderItem={(conversation) => {
                const participants = conversation.participants?.items || [];
                const isGroup = participants.length > 2;
                const isSelected = selectedConversation?.id === conversation.id;

                const hasUnread = conversation.lastMessageSenderId !== currentUser.id;

                let displayName = "Chat";
                let avatarSrc = null;

                if (isGroup) {
                  displayName = conversation.name && conversation.name.trim() !== ''
                    ? conversation.name
                    : participants.filter(item => item.userId !== currentUser.id)
                        .map(item => item.user?.nickname || "User").join(", ");
                } else {
                  const otherParticipant = participants.find(item => item.userId !== currentUser.id);
                  displayName = otherParticipant?.user?.nickname || "User";
                  avatarSrc = getAvatar(otherParticipant?.user?.avatar);
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
                    <Avatar
                      size={40}
                      style={{ backgroundColor: '#1890ff' }}
                      icon={<UserOutlined />}
                    >
                      G
                    </Avatar>
                  ) : (
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

                      let senderName = isCurrentUser ? "You" : (otherUser?.nickname || "User");
                      let senderAvatar = isCurrentUser ? selectAvatar(currentUser?.avatar) : selectAvatar(otherUser?.avatar);

                      if (otherUser?.isGroup && !isCurrentUser) {
                        const sender = otherUser.participants?.find(
                          p => p.userId === msg.senderId
                        );

                        if (sender) {
                          if (sender.user) {
                            senderName = sender.user.nickname || "User";
                            senderAvatar = selectAvatar(sender.user.avatar);
                          } else {
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

      <EditGroupChatModal
        isOpen={isEditGroupChatModalOpen && selectedConversation && otherUser?.isGroup}
        onClose={() => setIsEditGroupChatModalOpen(false)}
        conversationName={selectedConversation?.name || ""}
        conversation={selectedConversation || {}}
        currentUser={currentUser || {}}
        onGroupUpdated={handleGroupUpdate}
        onGroupDeleted={handleGroupDeleted}
        setConversations={setConversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />
      <CreateGroupChatModal
        isOpen={isCreateGroupChatModalOpen}
        onClose={() => setIsCreateGroupChatModalOpen(false)}
      />
    </>
  );
};

export default MessengerPage;