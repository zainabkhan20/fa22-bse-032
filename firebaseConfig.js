import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Module 1
import { getFirestore } from "firebase/firestore"; // Module 2 ke liye add kiya

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZiWvyla7r8KLYgveGyEaRibA_hdtGtos",
  authDomain: "mycode-33f51.firebaseapp.com",
  databaseURL: "https://mycode-33f51-default-rtdb.firebaseio.com", 
  projectId: "mycode-33f51",
  storageBucket: "mycode-33f51.appspot.com", 
  messagingSenderId: "978377235689",
  appId: "1:978377235689:web:4411e39cd85e959653a478"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ For Expo: use getAuth (Dono modules use karenge)
const auth = getAuth(app);

// ✅ For Realtime Database (Module 1 ke liye)
const db = getDatabase(app);

// ✅ For Firestore (Module 2 ke liye specific add kiya)
const firestore = getFirestore(app);

// Export mein 'firestore' add kiya gaya hai
export { auth, db, firestore };