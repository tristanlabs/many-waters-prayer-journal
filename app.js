// app.js (Phase: Public/Private Prayer Saving)

import { auth, db } from './firebase.js';
// Firestore imports (v9 modular)
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Auth import
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";


// DOM references
const prayerForm = document.getElementById("prayerForm");
const prayerList = document.getElementById("prayerList");

// Load prayers from localStorage 
async function renderPrayers() {
  prayerList.innerHTML = '';
  if (!auth.currentUser) return;

  const q = query(collection(db, "prayers"), where("userId", "==", auth.currentUser.uid));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const prayer = doc.data();
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
  const isPublic = document.getElementById("isPublic").checked;

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
  if (auth.currentUser) {
  try {
    await addDoc(collection(db, "prayers"), {
      ...prayer,
      userId: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });

    alert(isPublic ? "🙏 Public prayer submitted!" : "🕊 Private prayer saved.");
  } catch (error) {
    console.error("Error saving prayer:", error);
    alert("Error saving prayer. Try again.");
  }
}

  else {
    const prayers = JSON.parse(localStorage.getItem("prayers") || "[]");
    prayers.push(prayer);
    localStorage.setItem("prayers", JSON.stringify(prayers));
    renderPrayers();
  }

  // Reset form
  prayerForm.reset();
});

// Ensure user is authenticated + track presence
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    renderPrayers();

    // ✅ Update green banner message
    const warriorStatus = document.getElementById("warriorStatus");
    if (warriorStatus) {
      warriorStatus.textContent = "🟢 You are online!";
    }

    // ✅ Presence tracking
    const presenceRef = doc(db, "presence", user.uid);
    await setDoc(presenceRef, { online: true }, { merge: true });

    window.addEventListener("beforeunload", async () => {
      await setDoc(presenceRef, { online: false }, { merge: true });
    });
  }
});

// Logout button
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    alert("Logout failed: " + error.message);
  }
});

