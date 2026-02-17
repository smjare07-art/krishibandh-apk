// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  addDoc,
  setDoc,  
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyD730G2BHy745j76Kyul4rU78-TOEJlSs8",
  authDomain: "login-app-7a350.firebaseapp.com",
  projectId: "login-app-7a350",
  storageBucket: "login-app-7a350.firebasestorage.app",
  messagingSenderId: "238192589278",
  appId: "1:238192589278:web:48bdc337889946f44e054f"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// expose globally (optional)
window.auth = auth;
window.db = db;

// ================= AUTH STATE =================
onAuthStateChanged(auth, async (user) => {

  // 🔐 Protect pages (except login/signup)
  if (!user && !location.pathname.includes("login") && !location.pathname.includes("signup")) {
    window.location.href = "index.html";
    return;
  }

  // 🏠 HOME PAGE LOGIC
  if (user && location.pathname.includes("home")) {

    // Load user profile
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const d = snap.data();

      window.currentUserName = d.username || "";
      window.currentUserPhone = d.phone || "";
      window.currentUserEmail = d.email || "";
      window.currentUserLocation = d.location || "";

      const dataDiv = document.getElementById("data");
      if (dataDiv) {
        dataDiv.innerHTML = `
          <p><b>Name:</b> ${d.username}</p>
          <p><b>Email:</b> ${d.email}</p>
          <p><b>Phone:</b> ${d.phone || "-"}</p>
          <p><b>Location:</b> ${d.location || "-"}</p>
        `;
      }
    }

    loadWeatherGPS();
    loadMandiRates("Maharashtra");
    listenCompanyPostCount(); // 🔥 badge count
  }

  // 🏢 COMPANY / POSTS PAGE
  if (user && location.pathname.includes("company")) {
    listenCompanyPosts();
  }
});
// ================= COMPANY POSTS LIST =================
function listenCompanyPosts() {
  const container = document.getElementById("companyPosts");
  if (!container) return;

  const q = query(
    collection(db, "companyPosts"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = "<p>No company posts available</p>";
      return;
    }

    snapshot.forEach(docu => {
      const d = docu.data();
      const postId = docu.id;

      container.innerHTML += `
        <div style="border:1px solid #333;padding:12px;margin:12px;cursor:pointer"
             onclick="openPostDetail('${postId}')">

          <h3>${d.companyName} (${d.companyType})</h3>
          <p><b>Crop:</b> ${d.cropName} (${d.cropVariety})</p>
          <p><b>Grade:</b> ${d.cropGrade}</p>
          <p><b>Quantity:</b> ${d.totalQty}</p>
          <p><b>Price:</b> ₹${d.price}</p>
          <p><b>Pickup:</b> ${d.pickupLocation}</p>

        </div>
      `;
    });
  });
}


// ================= POST DETAIL MODAL =================
let currentPostId = null;

window.openPostDetail = async function (postId) {
  currentPostId = postId;

  const snap = await getDoc(doc(db, "companyPosts", postId));
  const d = snap.data();

  document.getElementById("postDetailView").innerHTML = `
    <p><b>Company:</b> ${d.companyName}</p>
    <p><b>Type:</b> ${d.companyType}</p>
    <p><b>Location:</b> ${d.companyLocation}</p>

    <hr>

    <p><b>Crop:</b> ${d.cropName} (${d.cropVariety})</p>
    <p><b>Grade:</b> ${d.cropGrade}</p>
    <p><b>Moisture:</b> ${d.moisture}%</p>
    <p><b>Total Qty:</b> ${d.totalQty}</p>

    <hr>

    <p><b>Price:</b> ₹${d.price} (${d.priceType})</p>
    <p><b>Pickup:</b> ${d.pickupLocation}</p>
    <p><b>Payment:</b> ${d.paymentTimeline}</p>

    <hr>

    <p><b>Notes:</b> ${d.notes || "-"}</p>
  `;

  document.getElementById("postModal").style.display = "block";
};

window.closeModal = function () {
  document.getElementById("postModal").style.display = "none";
};



// ================= FARMER APPLY =================
window.submitApplication = async function () {
  const user = auth.currentUser;
  if (!user || !currentPostId) return;

  const qty = document.getElementById("applyQty").value;
  const price = document.getElementById("applyPrice").value;
  const msg = document.getElementById("applyMsg").value;

  const userSnap = await getDoc(doc(db, "users", user.uid));
  const u = userSnap.data();

  await setDoc(
    doc(db, "companyPosts", currentPostId, "applications", user.uid),
    {
      farmerName: u.username,
      farmerPhone: u.phone || "",
      farmerLocation: u.location || "",
      quantityOffered: qty,
      expectedPrice: price,
      message: msg,
      status: "pending",
      appliedAt: new Date()
    }
  );

  alert("✅ Application sent to company");
  closeModal();
};



// ================= COMPANY POSTS COUNT (BADGE) =================
function listenCompanyPostCount() {
  const badge = document.getElementById("companyCount");
  if (!badge) return;

  const q = collection(db, "companyPosts");
  onSnapshot(q, (snapshot) => {
    badge.innerText = snapshot.size;
  });
}
// ================= COMPANY REQUIREMENT UPLOAD =================
window.uploadCompanyPost = async function () {
  try {
    await addDoc(collection(db, "companyPosts"), {
      companyName: companyName.value,
      companyType: companyType.value,
      contactPerson: contactPerson.value,
      companyPhone: companyPhone.value,
      companyEmail: companyEmail.value,
      companyLocation: companyLocation.value,

      cropName: cropName.value,
      cropVariety: cropVariety.value,
      cropGrade: cropGrade.value,
      moisture: moisture.value,
      organic: organic.value,

      totalQty: totalQty.value,
      minQty: minQty.value,
      maxQty: maxQty.value,

      price: price.value,
      priceType: priceType.value,

      pickupLocation: pickupLocation.value,
      deliveryLocation: deliveryLocation.value,
      pickupDate: pickupDate.value,
      transportBy: transportBy.value,

      paymentMethod: paymentMethod.value,
      paymentTimeline: paymentTimeline.value,
      advancePayment: advancePayment.value,

      packingType: packingType.value,
      bagWeight: bagWeight.value,
      inspection: inspection.value,
      rejectionPolicy: rejectionPolicy.value,

      startDate: startDate.value,
      endDate: endDate.value,
      requirementType: requirementType.value,

      gst: gst.value,
      fssai: fssai.value,
      exportLicense: exportLicense.value,

      notes: notes.value,
      createdAt: new Date()
    });

    alert("✅ Company requirement uploaded successfully");

  } catch (e) {
    alert(e.message);
  }
};

// ================= WEATHER (GPS BASED) =================
function loadWeatherGPS() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=ac6edff3239d192fae15d39ae6403ee4`
      );
      const data = await res.json();

      const tempEl = document.getElementById("weatherTemp");
      if (tempEl) tempEl.innerText = data.main.temp + "°C";

      const cityEl = document.getElementById("weatherCity");
      if (cityEl) cityEl.innerText = data.name;

      const iconEl = document.getElementById("weatherIcon");
      if (iconEl && data.weather?.length) {
        const condition = data.weather[0].main.toLowerCase();
        let icon = "☁️";
        if (condition.includes("clear")) icon = "☀️";
        else if (condition.includes("cloud")) icon = "☁️";
        else if (condition.includes("rain")) icon = "🌧️";
        else if (condition.includes("drizzle")) icon = "🌦️";
        else if (condition.includes("thunder")) icon = "⛈️";
        else if (condition.includes("snow")) icon = "❄️";
        else if (condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) icon = "🌫️";
        iconEl.innerText = icon;
      }

    } catch (e) {
      console.error("Weather error", e);
    }
  });
}

// ================= MANDI RATES =================
async function loadMandiRates(state) {
  const container = document.getElementById("mandiRates");
  if (!container) return;

  try {
    const url =
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070" +
      "?api-key=579b464db66ec23bdd000001343c9c4cc0464bb66221e639d0cc6174" +
      "&format=json&filters[state]=" + state;

    const res = await fetch(url);
    const data = await res.json();

    container.innerHTML = "";
    data.records.forEach(item => {
      container.innerHTML += `
        <div>🌾 ${item.commodity} | ₹${item.max_price}</div>
      `;
    });

  } catch (e) {
    container.innerHTML = "Error loading mandi rates";
  }
}

// ================= LOGOUT =================
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
import { updateDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// ================= LOAD APPLICATIONS =================
window.loadApplications = async function () {
  const postId = document.getElementById("postIdInput").value;
  const container = document.getElementById("applications");

  if (!postId) {
    alert("Post ID टाका");
    return;
  }

  const q = collection(db, "companyPosts", postId, "applications");

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = "<p>No applications</p>";
      return;
    }

    snapshot.forEach(docu => {
      const d = docu.data();
      const farmerId = docu.id;

      container.innerHTML += `
        <div style="border:1px solid #333;padding:10px;margin:10px">
          <p><b>Name:</b> ${d.farmerName}</p>
          <p><b>Phone:</b> ${d.farmerPhone}</p>
          <p><b>Location:</b> ${d.farmerLocation}</p>
          <p><b>Qty:</b> ${d.quantityOffered}</p>
          <p><b>Price:</b> ₹${d.expectedPrice}</p>
          <p><b>Status:</b> ${d.status}</p>

          <button onclick="updateStatus('${postId}','${farmerId}','accepted')">✅ Accept</button>
          <button onclick="updateStatus('${postId}','${farmerId}','rejected')">❌ Reject</button>
        </div>
      `;
    });
  });
};

// ================= ACCEPT / REJECT =================
window.updateStatus = async function (postId, farmerId, status) {
  await updateDoc(
    doc(db, "companyPosts", postId, "applications", farmerId),
    { status }
  );

  alert("Status updated: " + status);
};
