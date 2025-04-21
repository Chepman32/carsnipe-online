// GameSettings.js

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Slider, Card, Row, Col, Select } from 'antd'; // Import Select
import { useTranslation } from 'react-i18next'; // Import useTranslation
import 'antd/dist/reset.css';
import './GameSettings.css';
import { setDarkMode, setMusicVolume, setSoundEffectsOn } from '../../redux/slices/mainSettingsSlice';
import { toggleMusic, toggleDarkMode, toggleSoundEffects } from '../../redux/slices/quickSettingsSlice';
import {
  FOCUS_ZONES,
  SETTINGS_DARK_MODE,
  SETTINGS_SOUND_EFFECTS,
  SETTINGS_MUSIC_VOLUME,
  SETTINGS_LANGUAGE, // Add new focus key constant
  handleKeyDown as handleKeyDownAction,
  setFocusedZone,
  setCurrentFocusedElement,
  setSettingsNeedsToggle,
  setSettingsVolumeChange,
  setCurrentSettingsElement
} from '../../redux/slices/focusSlice';

const languageOptions = [
  { 
    value: 'en', 
    label: 'English',
    icon: 'https://flagcdn.com/w20/gb.png'
  },
  { 
    value: 'ru', 
    label: 'Русский',
    icon: 'https://flagcdn.com/w20/ru.png'
  },
  { 
    value: 'de', 
    label: 'Deutsch',
    icon: 'https://flagcdn.com/w20/de.png'
  },
  { 
    value: 'es', 
    label: 'Español',
    icon: 'https://flagcdn.com/w20/es.png'
  }
];

const GameSettings = () => {
  const dispatch = useDispatch();
  const { darkMode, musicOn, soundEffectsOn } = useSelector((state) => state.quickSettings);
  const { musicVolume } = useSelector((state) => state.mainSettings);
  const { focusedZone, currentSettingsElement, settingsNeedsToggle, settingsVolumeChange } = useSelector((state) => state.focus);
  const { t, i18n } = useTranslation(); // Get translation function and i18n instance

  const options = [
    { label: t('settings.darkMode'), type: 'switch', value: darkMode, key: SETTINGS_DARK_MODE },
    { label: t('settings.soundEffects'), type: 'switch', value: soundEffectsOn, key: SETTINGS_SOUND_EFFECTS },
    { label: t('settings.musicVolume'), type: 'slider', value: musicVolume, key: SETTINGS_MUSIC_VOLUME },
    { label: t('settings.language'), type: 'select', value: i18n.language, key: SETTINGS_LANGUAGE }, // Add language option
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
            ) : option.type === 'select' ? ( // Add condition for select type
              <Select
                value={option.value}
                style={{ width: 200 }}
                onChange={(value) => i18n.changeLanguage(value)}
                options={languageOptions.map(opt => ({
                  value: opt.value,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img 
                        src={opt.icon} 
                        alt={opt.label} 
                        style={{ width: '20px', height: '15px', objectFit: 'cover' }}
                      />
                      <span>{opt.label}</span>
                    </div>
                  )
                }))}
                size="large"
                className="language-selector"
              />
            ) : ( // Existing slider logic
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
