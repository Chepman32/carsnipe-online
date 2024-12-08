// src/pages/GameSettings/GameSettings.jsx
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Slider, Card, Row, Col } from 'antd';
import 'antd/dist/reset.css';
import './GameSettings.css';
import { setMusicVolume, setSoundEffectsVolume } from '../../redux/slices/mainSettingsSlice';
import { toggleMusic, toggleDarkMode } from '../../redux/slices/quickSettingsSlice';

const GameSettings = () => {
  const dispatch = useDispatch();
  const { musicVolume, soundEffectsVolume } = useSelector((state) => state.mainSettings);
  const { darkMode, musicOn } = useSelector((state) => state.quickSettings);

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
    // If dark mode switch is on and darkMode is false, toggle it on
    if (checked && !darkMode) {
      dispatch(toggleDarkMode());
    }
    // If dark mode switch is off and darkMode is true, toggle it off
    if (!checked && darkMode) {
      dispatch(toggleDarkMode());
    }
  };

  const handleMusicVolumeChange = (value) => {
    dispatch(setMusicVolume(value));

    if (value === 0 && musicOn) {
      dispatch(toggleMusic());
    }
    if (value > 0 && !musicOn) {
      dispatch(toggleMusic());
    }
  };

  const handleSoundEffectsVolumeChange = (value) => {
    dispatch(setSoundEffectsVolume(value));
  };

  return (
    <Card className="settings-container">
      <Row className="settings-row" align="middle" gutter={[16, 16]}>
        <Col span={12}>Dark Mode</Col>
        <Col span={12}>
          <Switch checked={darkMode} onChange={handleDarkModeChange} />
        </Col>
      </Row>
      <Row className="settings-row" align="middle" gutter={[16, 16]}>
        <Col span={12}>Sound Effects Volume</Col>
        <Col span={12}>
          <Slider
            min={0}
            max={100}
            value={soundEffectsVolume}
            onChange={handleSoundEffectsVolumeChange}
          />
        </Col>
      </Row>
      <Row className="settings-row" align="middle" gutter={[16, 16]}>
        <Col span={12}>Music Volume</Col>
        <Col span={12}>
          <Slider
            min={0}
            max={100}
            value={musicVolume}
            onChange={handleMusicVolumeChange}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default GameSettings;