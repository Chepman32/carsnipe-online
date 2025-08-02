const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
const fs = require("fs");
const path = require("path");

// Firebase config for carsnipe-online project
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // You'll need to get this from Firebase console
  authDomain: "carsnipe-online.firebaseapp.com",
  projectId: "carsnipe-online",
  storageBucket: "carsnipe-online.appspot.com",
  messagingSenderId: "786084555945",
  appId: "1:786084555945:web:xxxxxxxxxxxxxxxxxxxx",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadAsset(filePath, storagePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, fileBuffer);
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`✅ Uploaded: ${filePath} -> ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath}:`, error);
    return null;
  }
}

async function uploadVideos() {
  const videosDir = path.join(__dirname, "../public/videos");
  const files = fs.readdirSync(videosDir);

  for (const file of files) {
    if (file.endsWith(".mp4") || file.endsWith(".MP4")) {
      const filePath = path.join(videosDir, file);
      await uploadAsset(filePath, `videos/${file}`);
    }
  }
}

async function uploadImages() {
  const imagesDir = path.join(__dirname, "../src/assets/images");
  const files = fs.readdirSync(imagesDir);

  for (const file of files) {
    if (
      file.endsWith(".png") ||
      file.endsWith(".jpg") ||
      file.endsWith(".jpeg")
    ) {
      const filePath = path.join(imagesDir, file);
      await uploadAsset(filePath, `images/${file}`);
    }
  }
}

async function main() {
  console.log("🚀 Starting asset upload to Firebase Storage...");

  console.log("\n📹 Uploading videos...");
  await uploadVideos();

  console.log("\n🖼️ Uploading images...");
  await uploadImages();

  console.log("\n✅ Asset upload complete!");
  console.log("\nNext steps:");
  console.log("1. Update your code to use Firebase Storage URLs");
  console.log("2. Remove local asset files to reduce bundle size");
  console.log("3. Test the application to ensure all assets load correctly");
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadAsset, uploadVideos, uploadImages };
