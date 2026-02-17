import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  getFirestore,
  collectionGroup,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD730G2BHy745j76Kyul4rU78-TOEJlSs8",
  authDomain: "login-app-7a350.firebaseapp.com",
  projectId: "login-app-7a350",
  storageBucket: "login-app-7a350.firebasestorage.app",
  messagingSenderId: "238192589278",
  appId: "1:238192589278:web:48bdc337889946f44e054f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const list = document.getElementById("historyList");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  loadAcceptedDeals(user.uid);
});

function loadAcceptedDeals(uid) {

  const q = query(
    collectionGroup(db, "applications"),
    where("farmerId", "==", uid),
    where("status", "==", "accepted")
  );

  onSnapshot(q, (snap) => {
    list.innerHTML = "";

    if (snap.empty) {
      list.innerHTML = "<p>No accepted deals yet</p>";
      return;
    }

    snap.forEach(doc => {
      const d = doc.data();

      list.innerHTML += `
        <div class="card">
          <p class="ok">✔ Deal Accepted</p>
          <p><b>Company:</b> ${d.companyName || "-"}</p>
          <p><b>Crop:</b> ${d.cropName || "-"}</p>
          <p><b>Quantity:</b> ${d.quantityOffered || "-"}</p>
          <p><b>Final Price:</b> ₹${d.finalPrice || d.expectedPrice || "-"}</p>
        </div>
      `;
    });
  });
}
