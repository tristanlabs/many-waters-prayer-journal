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

// Load prayers 
async function renderPrayers() {
  prayerList.innerHTML = '';
  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;

  const privateQuery = query(collection(db, "prayers"), where("uid", "==", uid));
  const publicQuery = query(collection(db, "public_prayers"), where("uid", "==", uid));

  const [privateSnap, publicSnap] = await Promise.all([
    getDocs(privateQuery),
    getDocs(publicQuery)
  ]);

  [...privateSnap.docs, ...publicSnap.docs].forEach(doc => {
    const prayer = doc.data();
    const card = document.createElement('div');
    card.className = 'card mb-3';
    if (prayer.answered) card.classList.add('card-answered');

card.innerHTML = `
  <div class="card-body">
    <h5 class="card-title">${prayer.title}</h5>
    <p class="card-text">${prayer.details}</p>
    <p class="card-text"><small class="text-muted">Category: ${prayer.category}</small></p>
    <p class="card-text"><small class="text-muted">${prayer.answered ? '✅ Answered' : ''}</small></p>
    <p class="card-text"><small class="text-muted">${prayer.public ? '🌍 Public' : '🔒 Private'}</small></p>

    <div class="mt-2">
      ${!prayer.answered ? `<button class="btn btn-success btn-sm mark-answered" data-id="${doc.id}" data-public="${prayer.public}">Mark as Answered</button>` : ''}
      <button class="btn btn-warning btn-sm ms-2 share-testimony" data-title="${prayer.title}">Share Testimony</button>
    </div>
  </div>
`;
    prayerList.appendChild(card);
  });
  // Handle "Mark as Answered"
  document.querySelectorAll(".mark-answered").forEach(button => {
    button.addEventListener("click", async () => {
      const docId = button.getAttribute("data-id");
      const isPublic = button.getAttribute("data-public") === "true";
      const collectionName = isPublic ? "public_prayers" : "prayers";

      try {
        await setDoc(doc(db, collectionName, docId), { answered: true }, { merge: true });
        alert("🙏 Prayer marked as answered!");
        renderPrayers(); // Refresh UI
      } catch (err) {
        console.error("Error marking answered:", err);
        alert("Something went wrong.");
      }
    });
  });

  // Handle "Share Testimony"
  document.querySelectorAll(".share-testimony").forEach(button => {
    button.addEventListener("click", () => {
      const title = button.getAttribute("data-title");

      // Pre-fill title in modal
      document.getElementById("testimonyTitle").value = title;

      // Show modal
      const modal = new bootstrap.Modal(document.getElementById("testimonyModal"));
      modal.show();
    });
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

  // Save public + private prayers to Firestore
  if (auth.currentUser) {
  try {
    const collectionName = isPublic ? "public_prayers" : "prayers";
await addDoc(collection(db, collectionName), {
  ...prayer,
  uid: auth.currentUser.uid,
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

