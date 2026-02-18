// ================= SIDEBAR =================
window.openSidebar = function () {
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("overlay");

  if (sidebar) sidebar.classList.add("open");
  if (overlay) overlay.style.display = "block";
};

window.closeSidebar = function () {
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("overlay");

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

// ================= LOAD USER FROM MONGODB =================
document.addEventListener("DOMContentLoaded", async function () {

  console.log("HOME JS LOADED");

  var userId = localStorage.getItem("userId");

  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  try {

    var res = await fetch("http://localhost:5000/user/" + userId);

    if (!res.ok) {
      console.log("User fetch failed");
      return;
    }

    var user = await res.json();
    console.log("User Loaded:", user);

    // ===== ROLE CHECK (INSIDE ONLY) =====
    if (user.role === "company") {
      console.log("Company user logged in");
    } else {
      console.log("Farmer user logged in");
    }

    var homeName = document.getElementById("homeUserName");
    var sbName = document.getElementById("usernameSb");
    var sbPhone = document.getElementById("phoneSb");

    if (homeName) homeName.innerText = user.username || "User";
    if (sbName) sbName.innerText = user.username || "User";
    if (sbPhone) sbPhone.innerText = user.phone || "";

    // ================= GREETING =================
    var hour = new Date().getHours();
    var greet = "Hello";

    if (hour < 12) greet = "Good Morning";
    else if (hour < 18) greet = "Good Afternoon";
    else greet = "Good Evening";

    var greetEl = document.getElementById("greeting");
    if (greetEl) greetEl.innerText = greet;

    // ================= APPLY LANGUAGE =================
    if (typeof applyHomeLanguage === "function") {
      applyHomeLanguage(user.username);
    }

    // ================= LOAD WEATHER =================
    loadWeather();

    // ================= LOAD POST COUNT =================
    loadPostCount();

  } catch (err) {
    console.log("Error loading user:", err);
  }

});

// ================= LOAD POST COUNT =================
async function loadPostCount() {
  try {
    const res = await fetch("http://localhost:5000/posts/count");
    if (!res.ok) return;

    const data = await res.json();

    const badge = document.getElementById("companyCount");
    if (badge) {
      badge.innerText = data.count;
    }

  } catch (err) {
    console.log("Count Error:", err);
  }
}

// ================= WEATHER LOAD =================
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

      if (tempEl) tempEl.innerText = Math.round(data.main.temp) + "°C";
      if (cityEl) cityEl.innerText = data.name;

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

  });
}
