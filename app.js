// app.js (Phase: Public/Private Prayer Saving)

import { auth, db } from './firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// DOM references
const prayerForm = document.getElementById("prayerForm");
const prayerList = document.getElementById("prayerList");

// Load prayers from localStorage
function renderPrayers() {
  const prayers = JSON.parse(localStorage.getItem('prayers') || '[]');
  prayerList.innerHTML = '';
  prayers.forEach((prayer, index) => {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${prayer.title}</h5>
        <p class="card-text">${prayer.details}</p>
        <p class="card-text"><small class="text-muted">Category: ${prayer.category}</small></p>
        <p class="card-text"><small class="text-muted">${prayer.answered ? '✅ Answered' : ''}</small></p>
      </div>
    `;
    prayerList.appendChild(card);
  });
}

// Submit handler
prayerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const details = document.getElementById("details").value;
  const category = document.getElementById("category").value;
  const isPublic = document.getElementById("makePublic").checked;

  const prayer = {
    title,
    details,
    category,
    timestamp: new Date().toISOString(),
    public: isPublic,
    prayedCount: 0,
    answered: false
  };

  // Save public prayers to Firestore, private to localStorage
  if (isPublic && auth.currentUser) {
    try {
      await addDoc(collection(db, "public_prayers"), {
        ...prayer,
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp()
      });
      alert("🙏 Public prayer submitted!");
    } catch (error) {
      console.error("Error submitting public prayer:", error);
      alert("Error saving public prayer. Try again.");
    }
  } else {
    const prayers = JSON.parse(localStorage.getItem("prayers") || "[]");
    prayers.push(prayer);
    localStorage.setItem("prayers", JSON.stringify(prayers));
    renderPrayers();
  }

  // Reset form
  prayerForm.reset();
});

// Ensure user is authenticated
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    renderPrayers();
  }
});
