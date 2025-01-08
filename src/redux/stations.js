import Track1 from '../assets/music/Joey Valence & Brae - HOOLIGANG.mp3';
import Track2 from '../assets/music/SPARK MASTER TAPE - KKONKKRETE (OFFICIAL AUDIO).mp3';
import Track3 from '../assets/music/ZHU, partywithray - Came For The Low.mp3';
import Track4 from '../assets/music/Fergie - M.I.L.F. $ (Audio Version).mp3';
import Track5 from '../assets/music/Feel Good Inc. Gorillaz.mp3';
import Track6 from '../assets/music/Renegades Of Funk.mp3';
import Track7 from '../assets/music/Son of augustine - Ask Me How.mp3';
import Track8 from '../assets/music/Benny Benassi - Inside of Me HQ.mp3';
// Add more tracks as needed

export const stations = [
  {
    id: 'hiphop',
    name: 'Hip Hop',
    tracks: [
      { id: 1, name: 'Joey Valence & Brae - HOOLIGANG', url: Track1 },
      { id: 2, name: 'SPARK MASTER TAPE - KKONKKRETE (OFFICIAL AUDIO)', url: Track2 },
    ],
    icon: require('../assets/images/radio/Hip Hop.png'),
  },
  {
    id: 'electronic',
    name: 'Electronic',
    tracks: [
      { id: 3, name: 'ZHU, partywithray - Came For The Low', url: Track3 },
      { id: 8, name: 'Benny Benassi - Inside of Me HQ', url: Track8 },
    ],
    icon: require('../assets/images/radio/Electronic.png'),
  },
  {
    id: 'pop',
    name: 'Pop',
    tracks: [
      { id: 4, name: 'Fergie - M.I.L.F. $ (Audio Version)', url: Track4 },
      { id: 5, name: 'Feel Good Inc. Gorillaz', url: Track5 },
    ],
    icon: require('../assets/images/radio/Pop.png'),
  },
  {
    id: 'rock',
    name: 'Rock',
    tracks: [
      { id: 6, name: 'Renegades Of Funk', url: Track6 },
      { id: 7, name: 'Son of Augustine - Ask Me How', url: Track7 },
    ],
    icon: require('../assets/images/radio/Rock.png'),
  },
  // Add more stations as needed
];