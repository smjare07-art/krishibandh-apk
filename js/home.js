// ================= BASE URL =================
const BASE_URL = "https://krishibandh-backend.onrender.com";

// ================= SIDEBAR =================
window.openSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (sidebar) sidebar.classList.add("open");
  if (overlay) overlay.style.display = "block";
};

window.closeSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.style.display = "none";
};

// ================= PAGE NAVIGATION =================
window.go = function (page) {
  window.location.href = page;
};

// ================= LOGOUT =================
window.logout = function () {
  localStorage.clear();
  window.location.href = "index.html";
};

// ================= LOAD USER =================
document.addEventListener("DOMContentLoaded", async function () {

  const userId = localStorage.getItem("userId");

  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  try {

    const res = await fetch(`${BASE_URL}/user/${userId}`);

    if (!res.ok) {
      localStorage.clear();
      window.location.href = "index.html";
      return;
    }

    const user = await res.json();

    // ===== USER NAME + PHONE =====
    const homeName = document.getElementById("homeUserName");
    const sbName = document.getElementById("usernameSb");
    const sbPhone = document.getElementById("phoneSb");

    if (homeName) homeName.innerText = user.username || "User";
    if (sbName) sbName.innerText = user.username || "User";
    if (sbPhone) sbPhone.innerText = user.phone || "";

    // ===== SIDEBAR PROFILE IMAGE =====
    const sbImage = document.getElementById("sidebarImage");

    if (sbImage) {
      if (user.profileImage) {
        sbImage.src = `${BASE_URL}/${user.profileImage}`;
      } else {
        sbImage.src = "../img/default.png"; // fallback image
      }
    }

    // ===== GREETING =====
    const hour = new Date().getHours();
    let greet = "Hello";

    if (hour < 12) greet = "Good Morning 🌅";
    else if (hour < 18) greet = "Good Afternoon ☀️";
    else greet = "Good Evening 🌙";

    const greetEl = document.getElementById("greeting");
    if (greetEl) greetEl.innerText = greet;

    // ===== LOAD EXTRA DATA =====
    loadWeather();
    loadPostCount();

  } catch (err) {
    console.log("Error loading user:", err);
    localStorage.clear();
    window.location.href = "index.html";
  }

});

// ================= LOAD POST COUNT =================
async function loadPostCount() {
  try {

    const res = await fetch(`${BASE_URL}/posts/count`);
    if (!res.ok) return;

    const data = await res.json();

    const badge = document.getElementById("companyCount");
    if (badge) badge.innerText = data.count || 0;

  } catch (err) {
    console.log("Count Error:", err);
  }
}

// ================= WEATHER =================
function loadWeather() {

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async function (pos) {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    try {

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=ac6edff3239d192fae15d39ae6403ee4`
      );

      const data = await res.json();

      const tempEl = document.getElementById("weatherTemp");
      const cityEl = document.getElementById("weatherCity");
      const iconEl = document.getElementById("weatherIcon");

      if (tempEl && data.main)
        tempEl.innerText = Math.round(data.main.temp) + "°C";

      if (cityEl)
        cityEl.innerText = data.name || "";

      if (iconEl && data.weather && data.weather.length > 0) {

        const condition = data.weather[0].main.toLowerCase();
        let icon = "☁️";

        if (condition.includes("clear")) icon = "☀️";
        else if (condition.includes("cloud")) icon = "☁️";
        else if (condition.includes("rain")) icon = "🌧️";
        else if (condition.includes("thunder")) icon = "⛈️";
        else if (condition.includes("snow")) icon = "❄️";
        else if (condition.includes("mist") || condition.includes("fog")) icon = "🌫️";

        iconEl.innerText = icon;
      }

    } catch (err) {
      console.log("Weather error:", err);
    }

  }, function () {
    console.log("Geolocation permission denied");
  });

}