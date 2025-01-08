import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { playTrack, loadTracksRequest } from '../../redux/slices/musicPlayerSlice';
import { toggleMusic } from "../../redux/slices/quickSettingsSlice";

const MusicPlayer = () => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const { currentTrack, tracks } = useSelector((state) => state.musicPlayer);
  const { musicOn } = useSelector((state) => state.quickSettings);
  const { musicVolume } = useSelector((state) => state.mainSettings);

  useEffect(() => {
    dispatch(loadTracksRequest());
  }, [dispatch]);

  useEffect(() => {
    if (tracks.length > 0 && !currentTrack) {
      dispatch(playTrack(tracks[0]));
    }
  }, [dispatch, tracks, currentTrack]);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
        audioRef.current
          .play()
          .catch((err) => console.error('Playback error:', err));
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicOn ? musicVolume / 100 : 0;
      if (audioRef.current.paused) {
        audioRef.current.play().catch((err) => console.error('Playback error:', err));
      }
    }
  }, [musicOn, musicVolume]);

  const handleToggleMusic = () => {
    dispatch(toggleMusic());
  };

  const handleTrackEnd = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    dispatch(playTrack(tracks[nextIndex]));
  };

  return (
    <div style={{ display: 'none' }}>
      <audio ref={audioRef} onEnded={handleTrackEnd} autoPlay />
      <button onClick={handleToggleMusic}>Toggle Music</button>
    </div>
  );
};

export default MusicPlayer;