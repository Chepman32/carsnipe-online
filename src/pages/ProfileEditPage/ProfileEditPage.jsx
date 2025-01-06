import React, { useEffect, useState } from 'react';
import { Form, Input, Button, notification, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import avatar1 from "../../assets/images/avatars/avatar1.jpg";
import avatar2 from "../../assets/images/avatars/avatar2.jpg";
import avatar3 from "../../assets/images/avatars/avatar3.jpeg";
import avatar4 from "../../assets/images/avatars/avatar4.jpeg";
import avatar5 from "../../assets/images/avatars/avatar5.jpeg";
import avatar6 from "../../assets/images/avatars/avatar6.jpeg";
import avatar7 from "../../assets/images/avatars/avatar7.png";
import avatar8 from "../../assets/images/avatars/avatar8.jpeg";
import avatar9 from "../../assets/images/avatars/avatar9.png";
import avatar10 from "../../assets/images/avatars/avatar10.png";
import avatar11 from "../../assets/images/avatars/avatar11.jpeg";
import avatar12 from "../../assets/images/avatars/avatar12.jpeg";
import avatar13 from "../../assets/images/avatars/avatar13.png";
import avatar14 from "../../assets/images/avatars/avatar14.png";
import avatar15 from "../../assets/images/avatars/avatar15.png";
import avatar16 from "../../assets/images/avatars/avatar16.png";
import "./styles.css";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FOCUS_ZONES, HEADER_MAIN_MENU, setCurrentFocusedElement, setFocusedZone } from '../../redux/slices/focusSlice';

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
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar13,
  avatar14,
  avatar15,
  avatar16
};

const avatars = Object.keys(avatarMap);
const avatarsPerRow = 4; // Number of avatars in one row

const ProfileEditPage = ({ playerInfo, currentAuthenticatedUser, signOut, setPlayerInfo }) => {
  const [form] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState(playerInfo.nickname || "");
  const [bio, setBio] = useState(playerInfo.bio || "");
  const [focusedAvatarIndex, setFocusedAvatarIndex] = useState(0);

  const darkMode = useSelector((state) => state.quickSettings.darkMode);
  const { focusedZone } = useSelector((state) => state.focus);

  const dispatch = useDispatch();

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.PAGE) {
      setFocusedAvatarIndex(0);
    }
  }, [focusedZone]);

  useEffect(() => {
    if (playerInfo.nickname) setNickname(playerInfo.nickname);
    if (playerInfo.avatar) setSelectedAvatar(playerInfo.avatar);
    if (playerInfo.bio) setBio(playerInfo.bio);
  }, [playerInfo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT") {
        return;
      }

      let newIndex = focusedAvatarIndex;

      switch (event.key) {
        case "ArrowRight":
          if (focusedZone === FOCUS_ZONES.PAGE) {
            newIndex = (focusedAvatarIndex + 1) % avatars.length;
          }
          break;
        case "ArrowLeft":
          if (focusedZone === FOCUS_ZONES.PAGE) {
            newIndex = (focusedAvatarIndex - 1 + avatars.length) % avatars.length;
          }
          break;
        case "ArrowDown":
          if (focusedZone === FOCUS_ZONES.PAGE) {
            newIndex =
              focusedAvatarIndex + avatarsPerRow < avatars.length
                ? focusedAvatarIndex + avatarsPerRow
                : focusedAvatarIndex;
          }
          break;
        case "ArrowUp":
          if (focusedAvatarIndex < avatarsPerRow) {
            dispatch(setFocusedZone(FOCUS_ZONES.HEADER))
            dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU))
            setFocusedAvatarIndex(-1)
            return;
          }
          if (focusedZone === FOCUS_ZONES.PAGE) {
            newIndex =
              focusedAvatarIndex - avatarsPerRow >= 0
                ? focusedAvatarIndex - avatarsPerRow
                : focusedAvatarIndex;
          }
          break;
        case "Enter":
        case " ":
          setSelectedAvatar(avatars[focusedAvatarIndex]);
          break;
        default:
          break;
      }

      setFocusedAvatarIndex(newIndex);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedAvatarIndex, dispatch, focusedZone]);

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
      };
      await client.graphql({
        query: mutations.updateUser,
        variables: { input: updatedUser },
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

  const navigate = useNavigate();

  const handleSignOut = () => {
    setPlayerInfo(null);
    signOut();
    navigate('/');
    notification.info({
      message: 'Signed Out',
      description: 'You have been signed out successfully',
      placement: 'topRight',
    });
  };

  return (
    <>
      <div className={`profile-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="profile-box">
          <Title level={3} className="profile-title">
            Edit Profile: {playerInfo.nickname}
          </Title>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="avatar-container">
              {avatars.map((avatarName, index) => (
                <img
                  key={index}
                  src={avatarMap[avatarName]}
                  className={`avatar-item ${selectedAvatar === avatarName ? 'selected' : ''} ${
                    index === focusedAvatarIndex ? 'focused' : ''
                  }`}
                  alt={avatarName}
                  onClick={() => handleAvatarSelect(avatarName)}
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