// Asset Configuration
// Switch between local and external hosting

const USE_EXTERNAL_STORAGE = true; // Set to false to use local assets

const STORAGE_BASE_URL =
  "https://storage.googleapis.com/carsnipe-online.firebasestorage.app";

// Asset paths configuration
const ASSETS = {
  // Videos
  videos: {
    intro: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro.mp4`
      : "/videos/intro.mp4",
    intro1: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro1.mp4`
      : "/videos/intro1.mp4",
    intro2: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro2.MP4`
      : "/videos/intro2.MP4",
    intro3: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro3.mp4`
      : "/videos/intro3.mp4",
    intro4: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro4.MP4`
      : "/videos/intro4.MP4",
    intro5: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro5.MP4`
      : "/videos/intro5.MP4",
    intro6: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro6.mp4`
      : "/videos/intro6.mp4",
    intro7: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro7.mp4`
      : "/videos/intro7.mp4",
    intro8: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro8.mp4`
      : "/videos/intro8.mp4",
    intro9: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro9.mp4`
      : "/videos/intro9.mp4",
    intro10: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro10.mp4`
      : "/videos/intro10.mp4",
    intro11: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro11.mp4`
      : "/videos/intro11.mp4",
    intro12: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro12.mp4`
      : "/videos/intro12.mp4",
    intro13: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro13.mp4`
      : "/videos/intro13.mp4",
    intro14: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro14.mp4`
      : "/videos/intro14.mp4",
    intro15: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro15.mp4`
      : "/videos/intro15.mp4",
    intro16: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro16.mp4`
      : "/videos/intro16.mp4",
    intro17: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro17.mp4`
      : "/videos/intro17.mp4",
    intro18: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro18.mp4`
      : "/videos/intro18.mp4",
    intro19: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro19.mp4`
      : "/videos/intro19.mp4",
    intro20: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro20.mp4`
      : "/videos/intro20.mp4",
    intro21: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro21.mp4`
      : "/videos/intro21.mp4",
    intro22: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/videos/intro22.mp4`
      : "/videos/intro22.mp4",
  },

  // Images
  images: {
    logo: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/images/Logo.png`
      : "/src/assets/images/Logo.png",
    welcome: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/images/welcome.png`
      : "/src/assets/images/welcome.png",
    auctionsHub: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/images/auctionsHub.jpg`
      : "/src/assets/images/auctionsHub.jpg",
    // Add more images as needed
  },

  // Cars (lazy load these)
  cars: {
    baseUrl: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/images/cars/`
      : "/src/assets/images/cars/",
  },

  // Avatars
  avatars: {
    baseUrl: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/images/avatars/`
      : "/src/assets/images/avatars/",
  },

  // Achievements
  achievements: {
    baseUrl: USE_EXTERNAL_STORAGE
      ? `${STORAGE_BASE_URL}/images/achievements/`
      : "/src/assets/images/achievements/",
  },
};

// Helper functions
export const getVideoUrl = (videoName) => {
  return ASSETS.videos[videoName] || `${ASSETS.videos.baseUrl}${videoName}`;
};

export const getImageUrl = (imageName) => {
  return ASSETS.images[imageName] || `${ASSETS.images.baseUrl}${imageName}`;
};

export const getCarImageUrl = (carName) => {
  return `${ASSETS.cars.baseUrl}${carName}.png`;
};

export const getAvatarUrl = (avatarName) => {
  return `${ASSETS.avatars.baseUrl}${avatarName}`;
};

export const getAchievementUrl = (achievementName) => {
  return `${ASSETS.achievements.baseUrl}${achievementName}`;
};

// Preload critical assets
export const preloadAssets = () => {
  const criticalAssets = [
    ASSETS.images.logo,
    ASSETS.images.welcome,
    ASSETS.videos.intro,
  ];

  criticalAssets.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = url.includes(".mp4") ? "video" : "image";
    link.href = url;
    document.head.appendChild(link);
  });
};

export default ASSETS;
