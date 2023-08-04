const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");

const { initializeApp } = require("firebase/app");
require("dotenv").config();

//  Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const storage = getStorage(firebaseApp);

// Upload a file to Firebase Cloud Storage
exports.uploadFileToFirebase = async (file) => {
  const storageRef = ref(storage, `${file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    console.log("Uploaded a file to Firebase Cloud Storage!", snapshot);
    return snapshot;
  } catch (error) {
    console.error("Error uploading file to Firebase Cloud Storage:", error);
    throw error;
  }
};

// Get a download URL for a file from Firebase Cloud Storage
exports.getDownloadURLFromFirebase = async (filePath) => {
  const storageRef = ref(storage, filePath);

  try {
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Got download URL from Firebase Cloud Storage:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error(
      "Error getting download URL from Firebase Cloud Storage:",
      error
    );
    throw error;
  }
};
