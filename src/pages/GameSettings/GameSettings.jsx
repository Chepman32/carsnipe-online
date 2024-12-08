import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Slider, Card, Row, Col } from 'antd';
import 'antd/dist/reset.css';
import './GameSettings.css';
import { setDarkMode, setMusicVolume, setSoundEffectsOn } from '../../redux/slices/mainSettingsSlice';
import { toggleMusic, toggleDarkMode, toggleSoundEffects } from '../../redux/slices/quickSettingsSlice';

const GameSettings = () => {
  const dispatch = useDispatch();
  const { darkMode, musicOn, soundEffectsOn } = useSelector((state) => state.quickSettings);
  const { musicVolume } = useSelector((state) => state.mainSettings);
  
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
    if (checked !== darkMode) {
      dispatch(toggleDarkMode());
      dispatch(setDarkMode(checked));
    }
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
    if (checked !== soundEffectsOn) {
      dispatch(toggleSoundEffects());
      dispatch(setSoundEffectsOn(checked));
    }
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
        <Col span={12}>Sound Effects</Col>
        <Col span={12}>
          <Switch checked={soundEffectsOn} onChange={handleSoundEffectsChange} />
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