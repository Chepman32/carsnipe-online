import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Slider, Card, Row, Col } from 'antd';
import 'antd/dist/reset.css';
import './GameSettings.css';
import { setDarkMode, setMusicVolume, setSoundEffectsOn } from '../../redux/slices/mainSettingsSlice';
import { toggleMusic, toggleDarkMode, toggleSoundEffects } from '../../redux/slices/quickSettingsSlice';
import { HEADER_MAIN_MENU } from '../../shared/elementKeys';
import { useFocus } from '../../shared/FocusContext';
import { FOCUS_ZONES } from '../../shared/elementKeys';
import darkBackground from '../../assets/images/a9bdf515-102c-4bf3-abb4-afca1e533796-dark.png';

const GameSettings = ({ selectedElement, handleElementSelect }) => {
  const dispatch = useDispatch();
  const { darkMode, musicOn, soundEffectsOn } = useSelector((state) => state.quickSettings);
  const { musicVolume } = useSelector((state) => state.mainSettings);

  const { focusedZone, setFocusedZone } = useFocus();

  const [focusedIndex, setFocusedIndex] = useState(0);

  const options = [
    { label: 'Dark Mode', type: 'switch', value: darkMode },
    { label: 'Sound Effects', type: 'switch', value: soundEffectsOn },
    { label: 'Music Volume', type: 'slider', value: musicVolume }
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

  const handleKeyDown = (event) => {
    if (focusedZone !== FOCUS_ZONES.SETTINGS) {
      return;
    }

    const currentOption = options[focusedIndex];
    if (!currentOption) {
      return;
    }

    if (event.key === 'ArrowUp') {
      if (focusedIndex === 0) {
        handleElementSelect(HEADER_MAIN_MENU);
        setFocusedZone(FOCUS_ZONES.HEADER);
        event.preventDefault();
      } else {
        setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : options.length - 1));
      }
    } else if (event.key === 'ArrowDown') {
      setFocusedIndex((prevIndex) => (prevIndex < options.length - 1 ? prevIndex + 1 : 0));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if (currentOption.type === 'slider') {
        const adjustment = event.key === 'ArrowRight' ? 10 : -10;
        const newValue = Math.max(0, Math.min(100, currentOption.value + adjustment));
        handleMusicVolumeChange(newValue);
      } else if (currentOption.type === 'switch') {
        const newValue = event.key === 'ArrowRight';
        if (focusedIndex === 0) handleDarkModeChange(newValue);
        else if (focusedIndex === 1) handleSoundEffectsChange(newValue);
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (currentOption.type === 'switch') {
        const newValue = !currentOption.value;
        if (focusedIndex === 0) handleDarkModeChange(newValue);
        else if (focusedIndex === 1) handleSoundEffectsChange(newValue);
      }
    }
  };

  useEffect(() => {
    setFocusedZone(FOCUS_ZONES.SETTINGS);
    return () => {
      setFocusedZone(FOCUS_ZONES.PAGE);
    };
  }, [setFocusedZone]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedIndex, darkMode, soundEffectsOn, musicVolume, focusedZone, handleElementSelect]);

  return (
    <Card className="settings-container">
      {options.map((option, index) => (
        <Row
          key={option.label}
          className={`settings-row ${focusedIndex === index ? 'focused' : ''}`}
          align="middle"
          gutter={[16, 16]}
        >
          <Col span={12}>{option.label}</Col>
          <Col span={12}>
            {option.type === 'switch' ? (
              <Switch
                checked={option.value}
                onChange={(checked) => {
                  if (index === 0) handleDarkModeChange(checked);
                  else if (index === 1) handleSoundEffectsChange(checked);
                }}
              />
            ) : (
              <Slider
                min={0}
                max={100}
                value={option.value}
                onChange={(value) => handleMusicVolumeChange(value)}
              />
            )}
          </Col>
        </Row>
      ))}
    </Card>
  );
};

export default GameSettings;