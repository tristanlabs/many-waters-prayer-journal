// public.js (Phase 2: Public Prayer Wall)

import { db } from './firebase.js';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const publicPrayerList = document.getElementById("publicPrayerList");

// Render a single public prayer card
function renderPublicPrayer(docData, docId) {
  const card = document.createElement("div");
  card.className = "card mb-3";
  card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${docData.title}</h5>
      <p class="card-text">${docData.details}</p>
      <p class="card-text"><small class="text-muted">Category: ${docData.category}</small></p>
      <p class="card-text"><small class="text-muted">🙏 ${docData.prayedCount || 0} people prayed</small></p>
      <button class="btn btn-outline-success" data-id="${docId}">I prayed for this 🙏</button>
    </div>
  `;

  const btn = card.querySelector("button");
  btn.addEventListener("click", async () => {
    const prayerRef = doc(db, "public_prayers", docId);
    try {
      await updateDoc(prayerRef, {
        prayedCount: (docData.prayedCount || 0) + 1
      });
    } catch (error) {
      console.error("Error updating prayed count:", error);
    }
  });

  publicPrayerList.appendChild(card);
}

// Load all public prayers from Firestore in real-time
onSnapshot(collection(db, "public_prayers"), (snapshot) => {
  publicPrayerList.innerHTML = "";
  snapshot.forEach(doc => {
    renderPublicPrayer(doc.data(), doc.id);
  });
});
