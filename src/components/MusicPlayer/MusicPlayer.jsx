import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    playTrack,
    pauseTrack,
    loadTracksRequest,
} from '../../redux/slices/musicPlayerSlice';
import styles from "./musicPlayer.module.css";

const MusicPlayer = () => {
    const [showTrackList, setShowTrackList] = useState(false);
    const dispatch = useDispatch();
    const { currentTrack, isPlaying, tracks, loading, error } = useSelector(
        (state) => state.musicPlayer
    );

    useEffect(() => {
        dispatch(loadTracksRequest());
    }, [dispatch]);

    const handlePlay = (track) => {
        dispatch(playTrack(track));
    };

    const handlePause = () => {
        dispatch(pauseTrack());
    };

    return (
        <div className={styles.musicPlayer}>
            {loading && <p>Loading tracks...</p>}
            {error && <p>Error: {error}</p>}

            {currentTrack ? (
                <div className={styles.nowPlaying}>
                    Now Playing: {currentTrack.name}
                </div>
            ) : (
                <div className={styles.nowPlaying}>Select a track to play</div>
            )}

            <div className={styles.controls}>
                {isPlaying ? (
                    <button className={styles.controlButton} onClick={handlePause}>
                        Pause
                    </button>
                ) : (
                    currentTrack && (
                        <button
                            className={styles.controlButton}
                            onClick={() => handlePlay(currentTrack)}
                        >
                            Play
                        </button>
                    )
                )}
                <button
                    className={styles.trackListToggle}
                    onClick={() => setShowTrackList(!showTrackList)}
                >
                    {showTrackList ? 'Hide Playlist' : 'Show Playlist'}
                </button>
            </div>

            {showTrackList && (
                <ul className={styles.trackList}>
                    {tracks.map((track) => (
                        <li key={track.id} className={styles.trackItem}>
                            <span className={styles.trackName}>{track.name}</span>
                            <button
                                className={styles.playButton}
                                onClick={() => handlePlay(track)}
                            >
                                Play
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MusicPlayer;