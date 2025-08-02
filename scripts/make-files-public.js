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

async function makeFilesPublic() {
  console.log("🔓 Making all files publicly accessible...");

  try {
    // List all files in the bucket
    const [files] = await bucket.getFiles();

    console.log(`📁 Found ${files.length} files to make public`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        // Make the file publicly accessible
        await file.makePublic();
        console.log(`✅ Made public: ${file.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to make public: ${file.name}`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully made ${successCount} files public`);
    console.log(`❌ Failed to make ${errorCount} files public`);

    if (successCount > 0) {
      console.log("\n🎉 Files are now publicly accessible!");
      console.log("🔗 You can test with:");
      console.log(
        "   https://storage.googleapis.com/carsnipe-online.firebasestorage.app/images/cars/Alfa%20Romeo%204C.png"
      );
    }
  } catch (error) {
    console.error("❌ Error making files public:", error);
  }
}

if (require.main === module) {
  makeFilesPublic().catch(console.error);
}
