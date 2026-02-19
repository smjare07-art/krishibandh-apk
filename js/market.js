(function () {

  if (window.marketAppLoaded) return;
  window.marketAppLoaded = true;

  const BASE_URL = "https://krishibandh-backend.onrender.com";

  const MANDI_API_KEY =
    "579b464db66ec23bdd000001343c9c4cc0464bb66221e639d0cc6174";

  const MANDI_URL =
    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

  let allRecords = [];
  let favorites = JSON.parse(localStorage.getItem("favMandis") || "[]");

  async function getCropImage(query) {
    try {
      const res = await fetch(
        `${BASE_URL}/api/crop-image?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      return data.image;
    } catch {
      return "https://via.placeholder.com/300x200?text=Crop";
    }
  }

  window.loadMarket = async function () {

    const state =
      document.getElementById("stateSelect")?.value || "Maharashtra";

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

    } catch {
      container.innerHTML = "⚠️ Error loading data";
    }
  };

  function applyFilters() {

    const crop =
      document.getElementById("cropInput")?.value.toLowerCase() || "";

    const market =
      document.getElementById("marketInput")?.value.toLowerCase() || "";

    const filtered = allRecords.filter(r =>
      (r.commodity || "").toLowerCase().includes(crop) &&
      (r.market || "").toLowerCase().includes(market)
    );

    renderMarket(filtered);
  }

  async function renderMarket(records) {

    const container = document.getElementById("mandiRates");
    container.innerHTML = "";

    if (!records.length) {
      container.innerHTML = "❌ No data found";
      return;
    }

    for (const item of records) {

      const isFav = favorites.some(f =>
        f.market === item.market &&
        f.commodity === item.commodity
      );

      const imageUrl = await getCropImage(item.commodity);

      const change =
        Number(item.max_price) - Number(item.min_price);

      const card = document.createElement("div");
      card.className = "marketCard";

      card.innerHTML = `
        <div class="cardLeft">
          <h3>${item.commodity}</h3>
          <div class="market">📍 ${item.market}</div>
          <div class="price">Min ₹${item.min_price} | Max ₹${item.max_price}</div>
          <div class="date">📅 ${item.arrival_date}</div>

          <div class="bottomRow">
            <button class="shareBtn">🟢 Share</button>
            <div class="priceChange">
              ↑ ₹${change}
            </div>
          </div>
        </div>

        <div class="cardRight">
          <img src="${imageUrl}"
               onerror="this.src='https://via.placeholder.com/300x200?text=Crop'" />
          <span class="favStar">${isFav ? "⭐" : "☆"}</span>
        </div>
      `;

      card.querySelector(".favStar").onclick = () => toggleFav(item);
      card.querySelector(".shareBtn").onclick = () => shareWhatsApp(item);

      container.appendChild(card);
    }
  }

  function toggleFav(item) {

    const index = favorites.findIndex(f =>
      f.market === item.market &&
      f.commodity === item.commodity
    );

    if (index >= 0) favorites.splice(index, 1);
    else favorites.push(item);

    localStorage.setItem("favMandis", JSON.stringify(favorites));

    applyFilters();
    renderFavorites();
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
      div.className = "favItem";
      div.innerHTML = `⭐ ${item.market} – ${item.commodity}`;
      favDiv.appendChild(div);
    });
  }

  function shareWhatsApp(item) {

    const text =
      `🌾 Crop: ${item.commodity}\n` +
      `📍 Market: ${item.market}\n` +
      `💰 Min: ₹${item.min_price}\n` +
      `💰 Max: ₹${item.max_price}`;

    window.open(
      "https://wa.me/?text=" + encodeURIComponent(text),
      "_blank"
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadMarket();
    document.getElementById("cropInput")
      ?.addEventListener("input", applyFilters);
    document.getElementById("marketInput")
      ?.addEventListener("input", applyFilters);
  });

})();
