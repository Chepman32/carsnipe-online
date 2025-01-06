// GameSettings.js

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Slider, Card, Row, Col } from 'antd';
import 'antd/dist/reset.css';
import './GameSettings.css';
import { setDarkMode, setMusicVolume, setSoundEffectsOn } from '../../redux/slices/mainSettingsSlice';
import { toggleMusic, toggleDarkMode, toggleSoundEffects } from '../../redux/slices/quickSettingsSlice';
import {
  FOCUS_ZONES,
  SETTINGS_DARK_MODE,
  SETTINGS_SOUND_EFFECTS,
  SETTINGS_MUSIC_VOLUME,
  handleKeyDown as handleKeyDownAction,
  setFocusedZone,
  setCurrentFocusedElement,
  setSettingsNeedsToggle,
  setSettingsVolumeChange,
  setCurrentSettingsElement
} from '../../redux/slices/focusSlice';

const GameSettings = () => {
  const dispatch = useDispatch();
  const { darkMode, musicOn, soundEffectsOn } = useSelector((state) => state.quickSettings);
  const { musicVolume } = useSelector((state) => state.mainSettings);
  const { focusedZone, currentSettingsElement, settingsNeedsToggle, settingsVolumeChange } = useSelector((state) => state.focus);

  const options = [
    { label: 'Dark Mode', type: 'switch', value: darkMode, key: SETTINGS_DARK_MODE },
    { label: 'Sound Effects', type: 'switch', value: soundEffectsOn, key: SETTINGS_SOUND_EFFECTS },
    { label: 'Music Volume', type: 'slider', value: musicVolume, key: SETTINGS_MUSIC_VOLUME },
  ];

  const previousVolumeRef = useRef(musicVolume);

  useEffect(() => {
    if (!musicOn && musicVolume > 0) {
      previousVolumeRef.current = musicVolume;
      dispatch(setMusicVolume(0));
    } else if (musicOn && musicVolume === 0 && previousVolumeRef.current > 0) {
      dispatch(setMusicVolume(previousVolumeRef.current));
    }
  }, [musicOn, musicVolume, dispatch]);

  useEffect(() => {
    if (settingsNeedsToggle === SETTINGS_DARK_MODE) {
      handleDarkModeChange(!darkMode);
      dispatch(setSettingsNeedsToggle(null));
    } else if (settingsNeedsToggle === SETTINGS_SOUND_EFFECTS) {
      handleSoundEffectsChange(!soundEffectsOn);
      dispatch(setSettingsNeedsToggle(null));
    }
  }, [settingsNeedsToggle]);

  useEffect(() => {
    if (settingsVolumeChange !== 0) {
      const newVolume = Math.min(Math.max(musicVolume + settingsVolumeChange, 0), 100);
      handleMusicVolumeChange(newVolume);
      dispatch(setSettingsVolumeChange(0));
    }
  }, [settingsVolumeChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (focusedZone === FOCUS_ZONES.SETTINGS) {
        e.preventDefault();
        dispatch(handleKeyDownAction(e.key));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedZone, dispatch]);

  useEffect(() => {
    dispatch(setFocusedZone(FOCUS_ZONES.SETTINGS));
    focusedZone !== FOCUS_ZONES.SETTINGS && dispatch(setCurrentFocusedElement(SETTINGS_DARK_MODE));
    dispatch(setSettingsNeedsToggle(null));
  }, [dispatch]);

  const handleDarkModeChange = (checked) => {
    dispatch(toggleDarkMode());
    dispatch(setDarkMode(checked));
  };

  const handleMusicVolumeChange = (value) => {
    dispatch(setMusicVolume(value));
    if (value === 0 && musicOn) {
      dispatch(toggleMusic());
    } else if (value > 0 && !musicOn) {
      dispatch(toggleMusic());
    }
  };

  const handleSoundEffectsChange = (checked) => {
    dispatch(toggleSoundEffects());
    dispatch(setSoundEffectsOn(checked));
  };

  return (
    <Card className="settings-container">
      {options.map((option) => (
        <Row
          key={option.label}
          className={`settings-row ${
            currentSettingsElement === option.key ? 'focused' : ''
          }`}
          align="middle"
          gutter={[16, 16]}
        >
          <Col span={12}>{option.label}</Col>
          <Col span={12}>
            {option.type === 'switch' ? (
              <Switch
                checked={option.value}
                onChange={(checked) => {
                  if (option.key === SETTINGS_DARK_MODE) {
                    handleDarkModeChange(checked);
                  } else if (option.key === SETTINGS_SOUND_EFFECTS) {
                    handleSoundEffectsChange(checked);
                  }
                }}
              />
            ) : (
              <Row>
                <Col span={6}>
                  <span>{option.value}%</span>
                </Col>
                <Col span={18}>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={option.value}
                    onChange={(val) => handleMusicVolumeChange(val)}
                  />
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      ))}
    </Card>
  );
};

export default GameSettings;