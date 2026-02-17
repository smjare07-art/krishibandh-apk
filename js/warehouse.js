import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
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

let currentUserId = null;

// 🔐 Auth check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUserId = user.uid;
  loadWarehouseItems();
});

// ➕ Add item
window.addWarehouseItem = async function () {
  const cropName = document.getElementById("cropName").value;
  const quantity = document.getElementById("quantity").value;
  const storageType = document.getElementById("storageType").value;

  if (!cropName || !quantity) {
    alert("All fields required");
    return;
  }

  await addDoc(
    collection(db, "warehouses", currentUserId, "items"),
    {
      cropName,
      quantity,
      storageType,
      createdAt: new Date()
    }
  );

  document.getElementById("cropName").value = "";
  document.getElementById("quantity").value = "";
};

// 📦 Load items (REAL-TIME)
function loadWarehouseItems() {
  const list = document.getElementById("warehouseList");

  const q = query(
    collection(db, "warehouses", currentUserId, "items"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    list.innerHTML = "";

    if (snapshot.empty) {
      list.innerHTML = "No items stored";
      return;
    }

    snapshot.forEach(doc => {
      const d = doc.data();
      list.innerHTML += `
        <div style="border:1px solid #333;padding:8px;margin:8px">
          <p><b>Crop:</b> ${d.cropName}</p>
          <p><b>Qty:</b> ${d.quantity}</p>
          <p><b>Storage:</b> ${d.storageType}</p>
        </div>
      `;
    });
  });
}

