// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXOg97n9PWy1UnlxFxz0LFGsvsqBirx1s",
  authDomain: "many-waters-prayer-journal.firebaseapp.com",
  projectId: "many-waters-prayer-journal",
  storageBucket: "many-waters-prayer-journal.firebasestorage.app",
  messagingSenderId: "170476444962",
  appId: "1:170476444962:web:e2c1a5c8cec8a75fef997b",
  measurementId: "G-H34BZTDQ93"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check auth state
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    renderPrayers(user.uid);
    setupFormHandlers(user.uid);
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = 'login.html';
  });
});

// Render prayers from Firestore
async function renderPrayers(userId) {
  const prayerList = document.getElementById('prayerList');
  prayerList.innerHTML = '';
  const q = query(collection(db, "prayers"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const prayer = docSnap.data();
    const div = document.createElement('div');
    div.className = 'col-md-6 mb-3';
    div.innerHTML = `
      <div class="card bg-secondary text-light p-3">
        <h5>${prayer.title}</h5>
        <p>${prayer.details}</p>
        <small class="text-muted">${prayer.category}</small><br/>
        <button class="btn btn-sm ${prayer.answered ? 'btn-secondary' : 'btn-success'} mt-2" onclick="markAsAnswered('${docSnap.id}')">
          ${prayer.answered ? '✅ Answered' : 'Mark as Answered'}
        </button>
        <p class="mt-2">🙏 ${prayer.prayedCount || 0} people prayed</p>
      </div>
    `;
    prayerList.appendChild(div);
  });
}

// Handle Add Prayer form
function setupFormHandlers(userId) {
  document.getElementById('prayerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const details = document.getElementById('details').value.trim();
    const category = document.getElementById('category').value;
  const isPublic = document.getElementById('isPublic').checked;
    if (!title || !details) return;

    await addDoc(collection(db, "prayers"), {
    isPublic,
      userId,
      title,
      details,
      category,
      answered: false,
      prayedCount: 0,
      createdAt: new Date()
    });

    this.reset();
    renderPrayers(userId);
  });
}

// Mark a prayer as answered
async function markAsAnswered(id) {
  const prayerRef = doc(db, "prayers", id);
  await updateDoc(prayerRef, { answered: true });
  const user = auth.currentUser;
  if (user) renderPrayers(user.uid);
}

// === TESTIMONIES ===
document.getElementById('testimonyForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const testimonyText = document.getElementById('testimonyText').value.trim();
  const testimonyTitle = document.getElementById('testimonyTitle').value.trim();
  const user = auth.currentUser;
  if (!user || !testimonyText || !testimonyTitle) return;

  const q = query(collection(db, "testimonies"),
    where("userId", "==", user.uid),
    where("prayerTitle", "==", testimonyTitle)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    alert("Testimony for this prayer already shared.");
    return;
  }

  await addDoc(collection(db, "testimonies"), {
    userId: user.uid,
    prayerTitle: testimonyTitle,
    testimonyText,
    createdAt: new Date()
  });

  document.getElementById('testimonyForm').reset();
  const modal = bootstrap.Modal.getInstance(document.getElementById('testimonyModal'));
  modal.hide();
  setupTestimonyListener(user.uid);
});

async function renderTestimonies(userId) {
  const testimonyList = document.getElementById('testimonyList');
  testimonyList.innerHTML = '';
  const q = query(collection(db, "testimonies"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const t = docSnap.data();
    const div = document.createElement('div');
    div.className = 'card bg-secondary text-light mb-3 p-3';
    div.innerHTML = `
      <h6>${t.prayerTitle}</h6>
      <p>${t.testimonyText}</p>
      <small class="text-muted">${new Date(t.createdAt.seconds * 1000).toLocaleString()}</small>
    `;
    testimonyList.appendChild(div);
  });
}

// Pre-fill modal for sharing testimony
window.openTestimonyModal = function(title) {
  document.getElementById('testimonyTitle').value = title;
  document.getElementById('testimonyText').value = '';
  const modal = new bootstrap.Modal(document.getElementById('testimonyModal'));
  modal.show();
};

// Add to renderTestimonies()
async function renderTestimonies(userId) {
  const testimonyList = document.getElementById('testimonyList');
  testimonyList.innerHTML = '';
  const q = query(collection(db, "testimonies"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const t = docSnap.data();
    const div = document.createElement('div');
    div.className = 'card bg-secondary text-light mb-3 p-3';
    div.innerHTML = `
      <h6>${t.prayerTitle}</h6>
      <p id="testimonyText-${docSnap.id}">${t.testimonyText}</p>
      <small class="text-muted">${new Date(t.createdAt.seconds * 1000).toLocaleString()}</small>
      <div class="mt-2 d-flex gap-2">
        <button class="btn btn-sm btn-outline-light" onclick="editTestimony('${docSnap.id}', \`${t.testimonyText.replace(/`/g, '\`')}\`)">✏️ Edit</button>
        <button class="btn btn-sm btn-outline-light" disabled>❤️ Like</button>
        <button class="btn btn-sm btn-outline-light" disabled>🙏 Amen</button>
      </div>
    `;
    testimonyList.appendChild(div);
  });
}

// Edit Testimony
window.editTestimony = async function(id, currentText) {
  const newText = prompt("Edit your testimony:", currentText);
  if (!newText || newText === currentText) return;

  const testimonyRef = doc(db, "testimonies", id);
  await updateDoc(testimonyRef, { testimonyText: newText });

  const user = auth.currentUser;
  if (user) setupTestimonyListener(user.uid);
};


import { onSnapshot, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Enable real-time updates for testimonies
function setupTestimonyListener(userId) {
  const q = query(collection(db, "testimonies"), where("userId", "==", userId));
  onSnapshot(q, (snapshot) => {
    const testimonyList = document.getElementById('testimonyList');
    testimonyList.innerHTML = '';
    snapshot.forEach(docSnap => {
      const t = docSnap.data();
      const div = document.createElement('div');
      div.className = 'card bg-secondary text-light mb-3 p-3';
      div.innerHTML = `
        <h6>${t.prayerTitle}</h6>
        <p id="testimonyText-${docSnap.id}">${t.testimonyText}</p>
        <small class="text-muted">${new Date(t.createdAt.seconds * 1000).toLocaleString()}</small>
        <div class="mt-2 d-flex gap-2 align-items-center">
          <button class="btn btn-sm btn-outline-light" onclick="editTestimony('${docSnap.id}', \`${t.testimonyText.replace(/`/g, '\`')}\`)">✏️ Edit</button>
          <button class="btn btn-sm btn-outline-light" onclick="reactTestimony('${docSnap.id}', 'likes')">❤️ ${t.likes || 0}</button>
          <button class="btn btn-sm btn-outline-light" onclick="reactTestimony('${docSnap.id}', 'amens')">🙏 ${t.amens || 0}</button>
        </div>
      `;
      testimonyList.appendChild(div);
    });
  });
}

// Allow real-time reactions: likes / amens
window.reactTestimony = async function(id, field) {
  const ref = doc(db, "testimonies", id);
  await updateDoc(ref, { [field]: increment(1) });
};