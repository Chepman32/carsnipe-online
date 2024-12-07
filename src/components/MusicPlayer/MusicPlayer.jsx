import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  playTrack,
  loadTracksRequest,
} from '../../redux/slices/musicPlayerSlice';

const MusicPlayer = () => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const [savedTime, setSavedTime] = useState(0); // To track playback position when muted
  const { currentTrack, tracks } = useSelector((state) => state.musicPlayer);
  const { musicOn } = useSelector((state) => state.quickSettings);

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
        audioRef.current.currentTime = savedTime; // Set the playback position
        if (musicOn) {
          audioRef.current.play().catch((err) => {
            console.error('Playback error:', err);
          });
        }
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (!musicOn) {
        // Save current playback position and pause
        setSavedTime(audioRef.current.currentTime);
        audioRef.current.pause();
      } else {
        // Restore playback from saved position and unmute
        audioRef.current.currentTime = savedTime;
        audioRef.current.play().catch((err) => {
          console.error('Playback error:', err);
        });
      }
      audioRef.current.volume = musicOn ? 1 : 0;
      audioRef.current.muted = !musicOn;
    }
  }, [musicOn, savedTime]);

  const handleTrackEnd = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    dispatch(playTrack(tracks[nextIndex]));
  };

  return (
    <div style={{ display: 'none' }}>
      <audio ref={audioRef} onEnded={handleTrackEnd} autoPlay />
    </div>
  );
};

export default MusicPlayer;