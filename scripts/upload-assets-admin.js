const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin SDK
// You'll need to download a service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate new private key
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "carsnipe-online.firebasestorage.app",
});

const bucket = admin.storage().bucket();

// Asset directories
const VIDEOS_DIR = path.join(__dirname, "../public/videos");
const IMAGES_DIR = path.join(__dirname, "../src/assets/images");
const CARS_DIR = path.join(__dirname, "../src/assets/images/cars");
const AVATARS_DIR = path.join(__dirname, "../src/assets/images/avatars");
const ACHIEVEMENTS_DIR = path.join(
  __dirname,
  "../src/assets/images/achievements"
);

async function uploadFile(localFile, storagePath) {
  if (!fs.existsSync(localFile)) {
    console.log(`⚠️ File not found: ${localFile}`);
    return false;
  }

  console.log(`📤 Uploading ${localFile} to ${storagePath}`);

  try {
    await bucket.upload(localFile, {
      destination: storagePath,
      metadata: {
        cacheControl: "public, max-age=31536000", // Cache for 1 year
      },
    });
    console.log(`✅ Successfully uploaded ${storagePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${storagePath}:`, error.message);
    return false;
  }
}

async function uploadDirectory(localDir, storagePath) {
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

  for (const file of files) {
    if (file.startsWith(".")) continue; // Skip hidden files

    const localFile = path.join(localDir, file);
    const remotePath = `${storagePath}/${file}`;

    if (await uploadFile(localFile, remotePath)) {
      successCount++;
    }
  }

  console.log(
    `✅ Uploaded ${successCount}/${totalCount} files to ${storagePath}`
  );
}

async function main() {
  console.log("🚀 Starting asset upload to Firebase Storage...");
  console.log("📦 Project: carsnipe-online");
  console.log("🪣 Bucket: carsnipe-online.appspot.com");

  // Upload videos
  console.log("\n📹 Uploading videos...");
  await uploadDirectory(VIDEOS_DIR, "videos");

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

  for (const image of mainImages) {
    const localPath = path.join(IMAGES_DIR, image);
    await uploadFile(localPath, `images/${image}`);
  }

  // Upload cars
  console.log("\n🚗 Uploading car images...");
  await uploadDirectory(CARS_DIR, "images/cars");

  // Upload avatars
  console.log("\n👤 Uploading avatars...");
  await uploadDirectory(AVATARS_DIR, "images/avatars");

  // Upload achievements
  console.log("\n🏆 Uploading achievements...");
  await uploadDirectory(ACHIEVEMENTS_DIR, "images/achievements");

  console.log("\n✅ Asset upload complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Update your code to use the new asset URLs");
  console.log("2. Test the application to ensure all assets load correctly");
  console.log("3. Remove local asset files to reduce bundle size");
  console.log("\n🔗 Asset URLs will be:");
  console.log(
    "   https://storage.googleapis.com/carsnipe-online.appspot.com/videos/"
  );
  console.log(
    "   https://storage.googleapis.com/carsnipe-online.appspot.com/images/"
  );
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadFile, uploadDirectory };
