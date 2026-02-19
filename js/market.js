const MANDI_API_KEY = "579b464db66ec23bdd000001343c9c4cc0464bb66221e639d0cc6174";

const MANDI_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

let allRecords = [];
let favorites = JSON.parse(localStorage.getItem("favMandis") || "[]");

window.loadMarket = async function () {

  const state = document.getElementById("stateSelect").value;
  const container = document.getElementById("mandiRates");

  container.innerHTML = "⏳ Loading mandi rates...";

  try {

    const url =
      `${MANDI_URL}?api-key=${MANDI_API_KEY}` +
      `&format=json&filters[state]=${state}&limit=50`;

    const res = await fetch(url);
    const data = await res.json();

    allRecords = data.records || [];

    applyFilters();
    renderFavorites();

  } catch (err) {
    container.innerHTML = "⚠️ Error loading mandi data";
  }
};

function applyFilters() {

  const crop = document.getElementById("cropInput").value.toLowerCase();
  const market = document.getElementById("marketInput").value.toLowerCase();

  const filtered = allRecords.filter(r =>
    (r.commodity || "").toLowerCase().includes(crop) &&
    (r.market || "").toLowerCase().includes(market)
  );

  renderMarket(filtered);
  drawGraph(filtered.slice(0, 10));
}

function renderMarket(records) {

  const container = document.getElementById("mandiRates");
  container.innerHTML = "";

  if (!records.length) {
    container.innerHTML = "❌ No data found";
    return;
  }

  records.forEach(item => {

    const isFav = favorites.some(f =>
      f.market === item.market && f.commodity === item.commodity
    );

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <span class="star">${isFav ? "⭐" : "☆"}</span>
      <h3>${item.commodity}</h3>
      <div>📍 ${item.market}</div>
      <div class="price">Min ₹${item.min_price} | Max ₹${item.max_price}</div>
      <div>📅 ${item.arrival_date}</div>
      <button class="shareBtn">📤 Share</button>
    `;

    card.querySelector(".star").onclick = () => toggleFav(item);
    card.querySelector(".shareBtn").onclick = () => shareWhatsApp(item);

    container.appendChild(card);
  });
}

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
    favDiv.innerHTML = "<p style='padding-left:15px'>No favorites yet</p>";
    return;
  }

  favorites.forEach(item => {

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `⭐ ${item.market} – ${item.commodity}`;

    favDiv.appendChild(div);
  });
}

function drawGraph(records) {

  const canvas = document.getElementById("priceChart");
  if (!canvas || typeof Chart === "undefined") return;

  const ctx = canvas.getContext("2d");

  if (window.priceChart) window.priceChart.destroy();

  if (!records.length) return;

  window.priceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: records.map(r => r.market),
      datasets: [
        {
          label: "Max Price ₹",
          data: records.map(r => Number(r.max_price)),
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: "Min Price ₹",
          data: records.map(r => Number(r.min_price)),
          borderWidth: 2,
          tension: 0.3
        }
      ]
    },
    options: { responsive: true }
  });
}

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

loadMarket();

document.getElementById("cropInput").addEventListener("input", applyFilters);
document.getElementById("marketInput").addEventListener("input", applyFilters);
