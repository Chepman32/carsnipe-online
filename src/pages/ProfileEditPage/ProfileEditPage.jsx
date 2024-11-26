import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Avatar, notification, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import avatar1 from "../../assets/images/avatars/633acd8e-6641-4ad5-93a7-a2a4a7eedd2a.jpg";
import avatar2 from "../../assets/images/avatars/df6a476f-b3ca-42c9-ab86-d3a8f539e7d8.jpg";
import avatar3 from "../../assets/images/avatars/images (1).jpeg";
import avatar4 from "../../assets/images/avatars/images (2).jpeg";
import avatar5 from "../../assets/images/avatars/images (3).jpeg";
import avatar6 from "../../assets/images/avatars/images.jpeg";
import "./styles.css";
import { Link, useNavigate } from 'react-router-dom';

const client = generateClient();

const { Title } = Typography;
const { TextArea } = Input;

const avatarMap = {
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6, 
};

const avatars = Object.keys(avatarMap);

const ProfileEditPage = ({ playerInfo, currentAuthenticatedUser, signOut, setPlayerInfo }) => {
  const [form] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState(playerInfo.nickname || "");
  const [bio, setBio] = useState(playerInfo.bio || "");

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    if (playerInfo.nickname) setNickname(playerInfo.nickname);
    if (playerInfo.avatar) setSelectedAvatar(playerInfo.avatar);
    if (playerInfo.bio) setBio(playerInfo.bio);
  }, [playerInfo]);

  const handleAvatarSelect = (avatarName) => {
    setSelectedAvatar(avatarName);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const updatedUser = {
        id: playerInfo.id,
        nickname,
        bio,
        avatar: selectedAvatar,
        totalCarsOwned: playerInfo.totalCarsOwned, // Assuming we retain or increment this based on usage elsewhere
        totalAuctionsParticipated: playerInfo.totalAuctionsParticipated,
        totalBidsPlaced: playerInfo.totalBidsPlaced,
        totalSpent: playerInfo.totalSpent,
        totalAuctionsWon: playerInfo.totalAuctionsWon,
        totalProfitEarned: playerInfo.totalProfitEarned,
      };
      await client.graphql({
        query: mutations.updateUser,
        variables: {
          input: updatedUser,
        },
      });
      currentAuthenticatedUser();
      setLoading(false);
      notification.success({
        message: 'Profile Updated',
        description: `Nickname: ${nickname}`,
        placement: 'topRight',
      });
    } catch (error) {
      setLoading(false);
      notification.error({
        message: 'Update Failed',
        description: 'Failed to update profile',
        placement: 'topRight',
      });
    }
  };

  const navigate = useNavigate()

  const handleSignOut = () => {
    setPlayerInfo(null);
    signOut();
    navigate('/')
    notification.info({
      message: 'Signed Out',
      description: 'You have been signed out successfully',
      placement: 'topRight',
    });
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-box">
          <Title level={3} style={{ textAlign: 'center', marginBottom: '24px', fontWeight: 600 }}>
            Edit Profile: {playerInfo.nickname}
          </Title>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="avatar-container">
              {avatars.map((avatarName, index) => (
                <img
                  key={index}
                  src={avatarMap[avatarName]}
                  className={`avatar-item ${selectedAvatar === avatarName ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatarName)}
                  alt={avatarName}
                />
              ))}
            </div>
            <Form.Item>
              <Input 
                placeholder="Enter your nickname" 
                value={nickname} 
                onChange={(event) => setNickname(event.target.value)}
                className="input-field"
              />
            </Form.Item>
            <Form.Item>
              <TextArea 
                placeholder="Tell us a couple of words about yourself" 
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="textarea-field"
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                block
                className="save-button"
                loading={loading}
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
          <Button 
            danger
            icon={<LogoutOutlined />}
            onClick={handleSignOut}
            block
            className="signout-button"
          >
            Sign Out
          </Button>
        </div>
      </div>
      <Link 
        to="/achievements"
        type="primary" 
        className="achievementsButton"
      >
        My achievements
      </Link>
    </>
  );
};

export default ProfileEditPage;