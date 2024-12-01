// src/components/MusicPlayer/MusicPlayer.jsx

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  playTrack,
  pauseTrack,
  loadTracksRequest,
  setCurrentTrack,
} from '../../redux/slices/musicPlayerSlice';
import { 
  SkipBack, 
  SkipForward, 
  Pause, 
  Play, 
  Volume2,
  MessageSquare,
  List,
  X,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import classNames from 'classnames';
import styles from './musicPlayer.module.css';

const MusicPlayer = () => {
  const [showTrackList, setShowTrackList] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);

  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const { 
    currentTrack, 
    isPlaying, 
    tracks, 
    loading, 
    error 
  } = useSelector((state) => state.musicPlayer);

  // Load tracks on mount
  useEffect(() => {
    dispatch(loadTracksRequest());
  }, [dispatch]);

  // Automatically select the first track when tracks are loaded
  useEffect(() => {
    if (tracks.length > 0 && !currentTrack) {
      dispatch(setCurrentTrack(tracks[0]));
    }
  }, [tracks, currentTrack, dispatch]);

  // Update audio source when currentTrack changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();

      // Retrieve saved currentTime from localStorage
      const savedTime = localStorage.getItem(`track-${currentTrack.id}-currentTime`);
      if (savedTime) {
        audioRef.current.currentTime = parseFloat(savedTime);
      }

      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('Playback error:', err);
        });
      }
    }
  }, [currentTrack]);

  // Play or pause based on isPlaying state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('Playback error:', err);
        });
      } else {
        audioRef.current.pause();
        if (currentTrack) {
          localStorage.setItem(`track-${currentTrack.id}-currentTime`, audioRef.current.currentTime);
        }
      }
    }
  }, [isPlaying, currentTrack]);

  // Play a specific track
  const handlePlay = (track) => {
    if (track) {
      dispatch(playTrack(track));
    }
  };

  // Pause the current track
  const handlePause = () => {
    dispatch(pauseTrack());
  };

  // Handle progress bar changes
  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value, 10) || 0;
    setProgress(newProgress);
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  // Handle volume changes
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Update current time and progress as the audio plays
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      if (dur > 0) {
        setProgress((current / dur) * 100);
      }
    }
  };

  // Set duration once metadata is loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Format time in mm:ss
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // Skip to the previous track
  const handleSkipBack = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    if (currentIndex > 0) {
      const previousTrack = tracks[currentIndex - 1];
      dispatch(playTrack(previousTrack));
    }
  };

  // Skip to the next track
  const handleSkipForward = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    if (currentIndex < tracks.length - 1) {
      const nextTrack = tracks[currentIndex + 1];
      dispatch(playTrack(nextTrack));
    }
  };

  // Toggle the visibility of the player
  const togglePlayerVisibility = () => {
    setIsPlayerVisible(!isPlayerVisible);
    if (showTrackList) {
      setShowTrackList(false);
    }
  };

  // Toggle the visibility of the track list
  const toggleTrackList = () => {
    setShowTrackList(!showTrackList);
  };

  // Generate the track list
  const trackList = useMemo(() => {
    return tracks.map((track) => {
      const isCurrent = currentTrack?.id === track.id;
      const isTrackPlaying = isCurrent && isPlaying;

      return (
        <li 
          key={track.id} 
          className={`${styles.trackItem} ${
            isCurrent ? styles.activeTrack : ''
          }`}
        >
          <span className={styles.trackName}>{track.name}</span>
          <button
            className={styles.playButton}
            onClick={() => {
              if (isCurrent) {
                isPlaying ? handlePause() : handlePlay(track);
              } else {
                handlePlay(track);
              }
            }}
            title={isPlaying && isCurrent ? `Pause ${track.name}` : `Play ${track.name}`}
            aria-label={isPlaying && isCurrent ? `Pause ${track.name}` : `Play ${track.name}`}
          >
            {isPlaying && isCurrent ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </li>
      );
    });
  }, [tracks, currentTrack, isPlaying]);

  // Determine if the main play button should be disabled
  const isPlayButtonDisabled = loading || error;

  return (
    <div className={styles.musicPlayer}>
      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSkipForward}
      />
      
      {/* Player Container */}
      <div
        className={classNames(styles.container, {
          [styles.hidden]: !isPlayerVisible,
        })}
      >
        {/* Player Header */}
        <div className={styles.playerHeader}>
          <div className={styles.trackInfo}>
            {currentTrack ? currentTrack.name : 'Select a track to play'}
          </div>
          <button 
            className={styles.hideButton}
            onClick={togglePlayerVisibility}
            title="Hide Player"
            aria-label="Hide Player"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Display Loading or Error States */}
        {loading && <div className={styles.statusMessage}>Loading tracks...</div>}
        {error && <div className={styles.errorMessage}>Error: {error}</div>}

        {/* Player Content */}
        {!loading && !error && (
          <>
            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress}
                onChange={handleProgressChange}
                className={styles.progressBar}
                aria-label="Progress Bar"
                aria-valuenow={progress}
                aria-valuemax={100}
              />
              <div className={styles.timeInfo}>
                <span className={styles.currentTime}>{formatTime(currentTime)}</span>
                <span className={styles.timeRemaining}>-{formatTime(duration - currentTime)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
              {/* Volume Control */}
              <div className={styles.volumeContainer}>
                <Volume2 size={16} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className={styles.volumeSlider}
                  aria-label="Volume Control"
                />
              </div>

              {/* Main Playback Controls */}
              <div className={styles.mainControls}>
                <button 
                  className={styles.controlButton}
                  onClick={handleSkipBack}
                  disabled={!currentTrack || tracks.findIndex(track => track.id === currentTrack.id) === 0}
                  title="Previous Track"
                  aria-label="Previous Track"
                >
                  <SkipBack size={20} />
                </button>
                <button 
                  className={styles.controlButton}
                  onClick={isPlaying ? handlePause : () => currentTrack && handlePlay(currentTrack)}
                  disabled={isPlayButtonDisabled}
                  title={isPlaying ? "Pause" : "Play"}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button 
                  className={styles.controlButton}
                  onClick={handleSkipForward}
                  disabled={!currentTrack || tracks.findIndex(track => track.id === currentTrack.id) === tracks.length - 1}
                  title="Next Track"
                  aria-label="Next Track"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              {/* Extra Controls */}
              <div className={styles.extraControls}>
                <MessageSquare size={16} />
                <button
                  onClick={toggleTrackList}
                  className={styles.playlistButton}
                  title="Toggle Playlist"
                  aria-label="Toggle Playlist"
                >
                  <List size={16} />
                  {tracks.length > 0 && <div className={styles.notification} />}
                </button>
              </div>
            </div>

            {/* Track List */}
            <div
              className={classNames(styles.trackList, {
                [styles.visible]: showTrackList,
              })}
            >
              <div className={styles.trackListHeader}>
                <h3>Playlist</h3>
                <button 
                  className={styles.closeButton}
                  onClick={toggleTrackList}
                  title="Close Playlist"
                  aria-label="Close Playlist"
                >
                  <X size={16} />
                </button>
              </div>
              <ul>
                {trackList}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Minimized Player */}
      {!isPlayerVisible && (
        <div className={classNames(styles.minimizedPlayer, { [styles.hidden]: isPlayerVisible })}>
          <button 
            className={styles.showButton}
            onClick={togglePlayerVisibility}
            title="Show Player"
            aria-label="Show Player"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;