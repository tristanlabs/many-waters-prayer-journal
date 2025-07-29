// signup.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXOg97n9PWy1UnlxFxz0LFGsvsqBirx1s",
  authDomain: "many-waters-prayer-journal.firebaseapp.com",
  projectId: "many-waters-prayer-journal",
  storageBucket: "many-waters-prayer-journal.appspot.com",
  messagingSenderId: "170476444962",
  appId: "1:170476444962:web:e2c1a5c8cec8a75fef997b",
  measurementId: "G-H34BZTDQ93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Form submit listener
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const displayName = document.getElementById('displayName').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create Firestore user document
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: "user"
    });

    alert("Signup successful! Redirecting to home page...");
    window.location.href = "home.html";
  } catch (error) {
    console.error("Signup error:", error);
    alert("Error: " + error.message);
  }
});
