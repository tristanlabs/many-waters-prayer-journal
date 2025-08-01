// signup.js
import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


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
