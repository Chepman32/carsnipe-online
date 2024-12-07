// src/pages/GameSettings/GameSettings.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Slider, Card, Row, Col } from 'antd';
import 'antd/dist/reset.css';
import './GameSettings.css';
import { setDarkMode, setMusicVolume, setSoundEffectsVolume } from '../../redux/slices/mainSettingsSlice';

const GameSettings = () => {
  const dispatch = useDispatch();
  const { darkMode, musicVolume, soundEffectsVolume } = useSelector((state) => state.mainSettings);

  const handleDarkModeChange = (checked) => {
    dispatch(setDarkMode(checked));
  };

  const handleMusicVolumeChange = (value) => {
    dispatch(setMusicVolume(value));
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