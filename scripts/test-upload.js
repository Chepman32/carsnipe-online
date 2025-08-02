const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Check if service account file exists
const serviceAccountPath = path.join(
  __dirname,
  "../firebase-service-account.json"
);

if (!fs.existsSync(serviceAccountPath)) {
  console.log("❌ Service account file not found!");
  console.log("📋 Please download the service account key from:");
  console.log(
    "   https://console.firebase.google.com/project/carsnipe-online/settings/serviceaccounts/adminsdk"
  );
  console.log(
    '📁 Save it as "firebase-service-account.json" in your project root'
  );
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "carsnipe-online.firebasestorage.app",
});

const bucket = admin.storage().bucket();

async function testUpload() {
  console.log("🧪 Testing Firebase Storage upload...");

  // Test with a small file
  const testFile = path.join(
    __dirname,
    "../src/assets/images/offline-warning.png"
  );

  if (!fs.existsSync(testFile)) {
    console.log("❌ Test file not found. Using a different file...");
    // Try another file
    const altFile = path.join(__dirname, "../src/assets/images/Logo.png");
    if (fs.existsSync(altFile)) {
      await uploadFile(altFile, "test/Logo.png");
    } else {
      console.log("❌ No suitable test files found");
    }
    return;
  }

  await uploadFile(testFile, "test/offline-warning.png");
}

async function uploadFile(localFile, storagePath) {
  console.log(`📤 Uploading ${localFile} to ${storagePath}`);

  try {
    await bucket.upload(localFile, {
      destination: storagePath,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });
    console.log(`✅ Successfully uploaded ${storagePath}`);

    // Get the public URL
    const [url] = await bucket.file(storagePath).getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
    });
    console.log(`🔗 Public URL: ${url}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${storagePath}:`, error.message);
    return false;
  }
}

if (require.main === module) {
  testUpload().catch(console.error);
}
