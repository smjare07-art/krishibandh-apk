(function () {

  if (window.marketAppLoaded) return;
  window.marketAppLoaded = true;

  // ===== CONFIG =====
  const MANDI_API_KEY = "579b464db66ec23bdd000001343c9c4cc0464bb66221e639d0cc6174";
  const PEXELS_API_KEY = "pEcUKpYvD5puZWNoF7oy6L75AlnPs6sYLFcPolhkEo0YaPIG6ioZ2YFn";

  const MANDI_URL =
    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

  let allRecords = [];
  let favorites = JSON.parse(localStorage.getItem("favMandis") || "[]");
  let imageCache = {};

  // ===== FETCH IMAGE FROM PEXELS =====
  async function getCropImage(query) {

    if (imageCache[query]) return imageCache[query];

    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
        {
          headers: {
            Authorization: PEXELS_API_KEY
          }
        }
      );

      const data = await res.json();
      const image =
        data.photos?.[0]?.src?.medium ||
        "https://via.placeholder.com/400x300?text=Crop";

      imageCache[query] = image;
      return image;

    } catch (err) {
      return "https://via.placeholder.com/400x300?text=Crop";
    }
  }

  // ===== LOAD MARKET =====
  window.loadMarket = async function () {

    const state = document.getElementById("stateSelect")?.value || "Maharashtra";
    const container = document.getElementById("mandiRates");

    container.innerHTML = "⏳ Loading...";

    try {

      const url =
        `${MANDI_URL}?api-key=${MANDI_API_KEY}` +
        `&format=json&filters[state]=${state}&limit=20`;

      const res = await fetch(url);
      const data = await res.json();

      allRecords = data.records || [];

      applyFilters();
      renderFavorites();

    } catch (err) {
      container.innerHTML = "⚠️ Error loading mandi data";
    }
  };

  // ===== FILTER =====
  function applyFilters() {

    const crop = document.getElementById("cropInput")?.value.toLowerCase() || "";
    const market = document.getElementById("marketInput")?.value.toLowerCase() || "";

    const filtered = allRecords.filter(r =>
      (r.commodity || "").toLowerCase().includes(crop) &&
      (r.market || "").toLowerCase().includes(market)
    );

    renderMarket(filtered);
  }

  // ===== RENDER MARKET WITH IMAGE =====
  async function renderMarket(records) {

    const container = document.getElementById("mandiRates");
    container.innerHTML = "";

    if (!records.length) {
      container.innerHTML = "❌ No data found";
      return;
    }

    for (const item of records) {

      const isFav = favorites.some(f =>
        f.market === item.market && f.commodity === item.commodity
      );

      const imageUrl = await getCropImage(item.commodity);

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <span class="star">${isFav ? "⭐" : "☆"}</span>

        <img src="${imageUrl}" class="cropImg"/>

        <h3>${item.commodity}</h3>
        <div>📍 ${item.market}</div>
        <div class="price">Min ₹${item.min_price} | Max ₹${item.max_price}</div>
        <div>📅 ${item.arrival_date}</div>

        <button class="shareBtn">📤 Share</button>
      `;

      card.querySelector(".star").onclick = () => toggleFav(item);
      card.querySelector(".shareBtn").onclick = () => shareWhatsApp(item);

      container.appendChild(card);
    }
  }

  // ===== FAVORITES =====
  function toggleFav(item) {

    const index = favorites.findIndex(f =>
      f.market === item.market && f.commodity === item.commodity
    );

    if (index >= 0) favorites.splice(index, 1);
    else favorites.push(item);

    localStorage.setItem("favMandis", JSON.stringify(favorites));

    renderFavorites();
    applyFilters();
  }

  function renderFavorites() {

    const favDiv = document.getElementById("favList");
    favDiv.innerHTML = "";

    if (!favorites.length) {
      favDiv.innerHTML = "<p>No favorites yet</p>";
      return;
    }

    favorites.forEach(item => {

      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `⭐ ${item.market} – ${item.commodity}`;

      favDiv.appendChild(div);
    });
  }

  // ===== SHARE =====
  function shareWhatsApp(item) {

    const text =
      `🌾 Crop: ${item.commodity}\n` +
      `📍 Market: ${item.market}\n` +
      `💰 Min: ₹${item.min_price}\n` +
      `💰 Max: ₹${item.max_price}\n` +
      `📅 Date: ${item.arrival_date}`;

    const url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  }

  document.addEventListener("DOMContentLoaded", () => {

    loadMarket();

    document.getElementById("cropInput")?.addEventListener("input", applyFilters);
    document.getElementById("marketInput")?.addEventListener("input", applyFilters);
  });

})();
