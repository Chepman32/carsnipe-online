import React, { useEffect, useState } from 'react';
import { Form, Input, Button, notification, Typography, Select } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { supabase } from '../../supabase';
import * as api from '../../api/supabaseApi';
import "./styles.css";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FOCUS_ZONES, HEADER_MAIN_MENU, setCurrentFocusedElement, setFocusedZone } from '../../redux/slices/focusSlice';
import { avatars } from '../../avatars';
import { useDemoMode } from '../../contexts/DemoModeContext';


const { Title } = Typography;
const { TextArea } = Input;

const avatarsList = Object.keys(avatars);
const avatarsPerRow = 4; // Number of avatars in one row

const ProfileEditPage = ({ playerInfo, currentAuthenticatedUser, signOut, setPlayerInfo }) => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState(playerInfo?.nickname || "");
  const [bio, setBio] = useState(playerInfo?.bio || "");
  const [focusedAvatarIndex, setFocusedAvatarIndex] = useState(0);
  const [focusedElement, setFocusedElement] = useState('avatars'); // avatars, nickname, bio, achievements, signout
  const [isEditing, setIsEditing] = useState(false);

  const { isDemoMode, toggleDemoMode, updateDemoUser } = useDemoMode();
  const darkMode = useSelector((state) => state.quickSettings.darkMode);
  const { focusedZone } = useSelector((state) => state.focus);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.PAGE) {
      setFocusedElement('avatars');
      setFocusedAvatarIndex(0);
      setIsEditing(false);
    }
  }, [focusedZone]);

  useEffect(() => {
    if (playerInfo?.nickname) setNickname(playerInfo?.nickname);
    if (playerInfo?.avatar) setSelectedAvatar(playerInfo?.avatar);
    if (playerInfo?.bio) setBio(playerInfo?.bio);
  }, [playerInfo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isEditing && (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT")) {
        if (event.key === "Escape") {
          document.activeElement.blur();
          setIsEditing(false);
          return;
        }
        if (event.key === "Tab") {
          return;
        }
        return;
      }

      let newIndex = focusedAvatarIndex;

      switch (event.key) {
        case "ArrowRight":
          if (focusedElement === 'avatars') {
            // Check if we're at the end of a row
            const currentRow = Math.floor(focusedAvatarIndex / avatarsPerRow);
            const positionInRow = focusedAvatarIndex % avatarsPerRow;
            
            // Only move right if we're not at the end of the row
            if (positionInRow < avatarsPerRow - 1 && focusedAvatarIndex + 1 < avatars.length) {
              newIndex = focusedAvatarIndex + 1;
            } else {
              // Stay at current position if at end of row
              newIndex = focusedAvatarIndex;
            }
          } else if (focusedElement === 'signout') {
            setFocusedElement('achievements');
          } else if (focusedElement === 'achievements') {
            setFocusedElement('signout');
          }
          break;
        case "ArrowLeft":
          if (focusedElement === 'avatars') {
            // Check position in row
            const positionInRow = focusedAvatarIndex % avatarsPerRow;
            
            // Only move left if we're not at the start of the row
            if (positionInRow > 0) {
              newIndex = focusedAvatarIndex - 1;
            } else {
              // Stay at current position if at start of row
              newIndex = focusedAvatarIndex;
            }
          } else if (focusedElement === 'achievements') {
            setFocusedElement('signout');
          } else if (focusedElement === 'signout') {
            setFocusedElement('achievements');
          }
          break;
        case "ArrowDown":
          if (focusedElement === 'avatars') {
            if (focusedAvatarIndex + avatarsPerRow < avatarsList.length) {
              newIndex = focusedAvatarIndex + avatarsPerRow;
            } else {
              setFocusedElement('nickname');
              setFocusedAvatarIndex(-1);
              return;
            }
          } else if (focusedElement === 'nickname') {
            setFocusedElement('bio');
            return;
          } else if (focusedElement === 'bio') {
            setFocusedElement('save');
            return;
          } else if (focusedElement === 'save') {
            setFocusedElement('signout');
            return;
          } else if (focusedElement === 'achievements') {
            setFocusedElement('save');
            return;
          } else if (focusedElement === 'signout') {
            setFocusedElement('achievements');
            return;
          }
          break;
        case "ArrowUp":
          if (focusedAvatarIndex < avatarsPerRow && focusedElement === 'avatars') {
            dispatch(setFocusedZone(FOCUS_ZONES.HEADER))
            dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU))
            setFocusedAvatarIndex(-1)
            return;
          } else if (focusedElement === 'nickname') {
            setFocusedElement('avatars');
            setFocusedAvatarIndex(avatarsList.length - 1);
            return;
          } else if (focusedElement === 'bio') {
            setFocusedElement('nickname');
            return;
          } else if (focusedElement === 'save') {
            setFocusedElement('bio');
            return;
          } else if (focusedElement === 'signout') {
            setFocusedElement('save');
            return;
          } else if (focusedElement === 'achievements') {
            setFocusedElement('signout');
            return;
          }
          if (focusedElement === 'avatars') {
            newIndex = focusedAvatarIndex - avatarsPerRow >= 0 ? focusedAvatarIndex - avatarsPerRow : focusedAvatarIndex;
          }
          break;
        case "Enter":
        case " ":
          if (focusedElement === 'avatars') {
            setSelectedAvatar(avatarsList[focusedAvatarIndex]);
          } else if (focusedElement === 'achievements') {
            window.location.href = '/achievements#/achievements';
          } else if (focusedElement === 'nickname' || focusedElement === 'bio') {
            setIsEditing(true);
            const element = focusedElement === 'nickname' ? 
              document.querySelector('.input-field') : 
              document.querySelector('.textarea-field');
            if (element) {
              element.focus();
            }
          } else if (focusedElement === 'save') {
            // This is the key part - manually trigger form submission
            handleSubmit();
          } else if (focusedElement === 'signout') {
            handleSignOut();
          }
          break;
        default:
          break;
      }

      if (focusedElement === 'avatars') {
        setFocusedAvatarIndex(newIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedAvatarIndex, dispatch, focusedZone, focusedElement, isEditing]);

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

      if (isDemoMode) {
        // In demo mode, use the updateDemoUser function from context
        // This will update the demoUser state and localStorage
        const updatedDemoUser = {
          nickname,
          bio,
          avatar: selectedAvatar,
        };
        
        // Update demo user using the context function
        const result = updateDemoUser(updatedDemoUser);
        
        // Update player info in parent component
        if (result) {
          setPlayerInfo(result);
        }
        
        setLoading(false);
        notification.success({
          message: 'Profile Updated',
          description: `Nickname: ${nickname}`,
          placement: 'topRight',
        });
      } else {
        // Normal mode - make backend request
        await api.updateUser(playerInfo.id, updatedUser);
        currentAuthenticatedUser();
        setLoading(false);
        notification.success({
          message: 'Profile Updated',
          description: `Nickname: ${nickname}`,
          placement: 'topRight',
        });
      }
    } catch (error) {
      setLoading(false);
      notification.error({
        message: 'Update Failed',
        description: 'Failed to update profile',
        placement: 'topRight',
      });
    }
  };

  const handleSignOut = () => {
    // First, show notification
    notification.info({
      message: 'Signed Out',
      description: 'You have been signed out successfully',
      placement: 'topRight',
    });
    
    // Clear user data
    setPlayerInfo(null);
    
    // Handle demo mode
    if (isDemoMode) {
      toggleDemoMode(); // Exit demo mode
    }
    
    // Perform sign out
    signOut();
    
    // Navigate to root route which will show the sign-in page
    // since the user is now signed out
    navigate('/');
  };

  return (
    <>
      <div className={"profile-container " + (darkMode ? 'dark-mode' : 'light-mode')}>
        <Link
          to="/achievements#/achievements"
          className={"achievements-button " + (focusedElement === 'achievements' ? 'focused' : '')}
        >
          My Achievements
        </Link>
        <div className="profile-box">
          <Title level={3} className="profile-title">
            {t('settings.title')}: {playerInfo?.nickname}
          </Title>
          <div className="avatar-container">
            {avatarsList.map((avatarName, index) => (
              <img
                key={index}
                src={avatars[avatarName]}
                className={"avatar-item " + (selectedAvatar === avatarName ? 'selected' : '') + (index === focusedAvatarIndex ? ' focused' : '')}
                alt={avatarName}
                onClick={() => handleAvatarSelect(avatarName)}
              />
            ))}
          </div>
          <div className="profile-form">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item>
                <Input
                  placeholder={t('settings.selectLanguage')}
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className={"input-field " + (focusedElement === 'nickname' && !isEditing ? 'focused' : '')}
                  onClick={() => setIsEditing(true)}
                />
              </Form.Item>
              <Form.Item>
                <TextArea
                  placeholder="Tell us a couple of words about yourself"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={"textarea-field " + (focusedElement === 'bio' && !isEditing ? 'focused' : '')}
                  onClick={() => setIsEditing(true)}
                />
              </Form.Item>
            </Form>
            <Button
              type="primary"
              onClick={handleSubmit}
              block
              className={"save-button " + (focusedElement === 'save' ? 'focused' : '')}
              loading={loading}
            >
              Save Changes
            </Button>
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleSignOut}
              block
              className={"signout-button " + (focusedElement === 'signout' ? 'focused' : '')}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileEditPage;
