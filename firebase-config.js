// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase, ref, set, get, onValue } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// IMPORTANT: ต้องเปลี่ยนเป็น Config ของคุณเองจาก Firebase Console
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBa5pa7NS6XrS1yNd3Vl0SPxMamdczVXuc",
  authDomain: "valentine-project-e9c53.firebaseapp.com",
  databaseURL: "https://valentine-project-e9c53-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "valentine-project-e9c53",
  storageBucket: "valentine-project-e9c53.firebasestorage.app",
  messagingSenderId: "118936431447",
  appId: "1:118936431447:web:45d13be4a9065fb5d8ec12",
  measurementId: "G-62E4J10RTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, onValue };