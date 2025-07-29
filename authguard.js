// authGuard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAXOg97n9PWy1UnlxFxz0LFGsvsqBirx1s",
  authDomain: "many-waters-prayer-journal.firebaseapp.com",
  projectId: "many-waters-prayer-journal",
  storageBucket: "many-waters-prayer-journal.appspot.com",
  messagingSenderId: "170476444962",
  appId: "1:170476444962:web:e2c1a5c8cec8a75fef997b",
  measurementId: "G-H34BZTDQ93"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth Guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});
