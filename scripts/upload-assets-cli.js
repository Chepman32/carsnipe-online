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

function uploadDirectory(localDir, storagePath) {
  if (!fs.existsSync(localDir)) {
    console.log(`⚠️ Directory not found: ${localDir}`);
    return;
  }

  console.log(
    `📤 Uploading ${localDir} to gs://${STORAGE_BUCKET}/${storagePath}`
  );

  try {
    execSync(
      `gsutil -m cp -r "${localDir}/*" gs://${STORAGE_BUCKET}/${storagePath}/`,
      {
        stdio: "inherit",
      }
    );
    console.log(`✅ Successfully uploaded ${storagePath}`);
  } catch (error) {
    console.error(`❌ Failed to upload ${storagePath}:`, error.message);
  }
}

function uploadSingleFile(localFile, storagePath) {
  if (!fs.existsSync(localFile)) {
    console.log(`⚠️ File not found: ${localFile}`);
    return;
  }

  console.log(
    `📤 Uploading ${localFile} to gs://${STORAGE_BUCKET}/${storagePath}`
  );

  try {
    execSync(`gsutil cp "${localFile}" gs://${STORAGE_BUCKET}/${storagePath}`, {
      stdio: "inherit",
    });
    console.log(`✅ Successfully uploaded ${storagePath}`);
  } catch (error) {
    console.error(`❌ Failed to upload ${storagePath}:`, error.message);
  }
}

async function main() {
  console.log("🚀 Starting asset upload to Firebase Storage...");
  console.log(`📦 Project: ${PROJECT_ID}`);
  console.log(`🪣 Bucket: ${STORAGE_BUCKET}`);

  // Check if gsutil is available
  try {
    execSync("gsutil --version", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ gsutil not found. Please install Google Cloud SDK:");
    console.error("   https://cloud.google.com/sdk/docs/install");
    return;
  }

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
    uploadSingleFile(localPath, `images/${image}`);
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

module.exports = { uploadDirectory, uploadSingleFile };
