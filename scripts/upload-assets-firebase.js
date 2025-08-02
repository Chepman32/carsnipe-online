const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const PROJECT_ID = "carsnipe-online";
const STORAGE_BUCKET = `${PROJECT_ID}.appspot.com`;

// Asset directories
const VIDEOS_DIR = path.join(__dirname, "../public/videos");
const IMAGES_DIR = path.join(__dirname, "../src/assets/images");
const CARS_DIR = path.join(__dirname, "../src/assets/images/cars");
const AVATARS_DIR = path.join(__dirname, "../src/assets/images/avatars");
const ACHIEVEMENTS_DIR = path.join(
  __dirname,
  "../src/assets/images/achievements"
);

function uploadFile(localFile, storagePath) {
  if (!fs.existsSync(localFile)) {
    console.log(`⚠️ File not found: ${localFile}`);
    return false;
  }

  console.log(`📤 Uploading ${localFile} to ${storagePath}`);

  try {
    execSync(`firebase storage:upload "${localFile}" "${storagePath}"`, {
      stdio: "inherit",
    });
    console.log(`✅ Successfully uploaded ${storagePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${storagePath}:`, error.message);
    return false;
  }
}

function uploadDirectory(localDir, storagePath) {
  if (!fs.existsSync(localDir)) {
    console.log(`⚠️ Directory not found: ${localDir}`);
    return;
  }

  const files = fs.readdirSync(localDir);
  let successCount = 0;
  let totalCount = files.length;

  console.log(
    `📤 Uploading ${files.length} files from ${localDir} to ${storagePath}`
  );

  files.forEach((file) => {
    const localFile = path.join(localDir, file);
    const remotePath = `${storagePath}/${file}`;

    if (uploadFile(localFile, remotePath)) {
      successCount++;
    }
  });

  console.log(
    `✅ Uploaded ${successCount}/${totalCount} files to ${storagePath}`
  );
}

async function main() {
  console.log("🚀 Starting asset upload to Firebase Storage...");
  console.log(`📦 Project: ${PROJECT_ID}`);
  console.log(`🪣 Bucket: ${STORAGE_BUCKET}`);

  // Upload videos
  console.log("\n📹 Uploading videos...");
  uploadDirectory(VIDEOS_DIR, "videos");

  // Upload main images
  console.log("\n🖼️ Uploading main images...");
  const mainImages = [
    "Logo.png",
    "welcome.png",
    "auctionsHub.jpg",
    "auctionsHub - dark mode.png",
    "soft-background.png",
    "Forza-Horizon-5-Playlist-Cars.png",
  ];

  mainImages.forEach((image) => {
    const localPath = path.join(IMAGES_DIR, image);
    uploadFile(localPath, `images/${image}`);
  });

  // Upload cars
  console.log("\n🚗 Uploading car images...");
  uploadDirectory(CARS_DIR, "images/cars");

  // Upload avatars
  console.log("\n👤 Uploading avatars...");
  uploadDirectory(AVATARS_DIR, "images/avatars");

  // Upload achievements
  console.log("\n🏆 Uploading achievements...");
  uploadDirectory(ACHIEVEMENTS_DIR, "images/achievements");

  console.log("\n✅ Asset upload complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Update your code to use the new asset URLs");
  console.log("2. Test the application to ensure all assets load correctly");
  console.log("3. Remove local asset files to reduce bundle size");
  console.log("\n🔗 Asset URLs will be:");
  console.log(`   https://storage.googleapis.com/${STORAGE_BUCKET}/videos/`);
  console.log(`   https://storage.googleapis.com/${STORAGE_BUCKET}/images/`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadFile, uploadDirectory };
