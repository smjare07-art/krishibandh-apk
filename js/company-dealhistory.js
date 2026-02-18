const BASE_URL = "https://krishibandh-backend.onrender.com";

const companyId = localStorage.getItem("userId");

if (!companyId) {
  alert("Please login first");
  window.location.href = "company-login.html";
}

const container = document.getElementById("dealList");

async function loadDeals() {

  try {

    const res = await fetch(
      `${BASE_URL}/company/paid-deals/${companyId}`
    );

    if (!res.ok) {
      console.log("Route error:", res.status);
      container.innerHTML = "<p>Error loading deals</p>";
      return;
    }

    const deals = await res.json();

    container.innerHTML = "";

    if (!deals || deals.length === 0) {
      container.innerHTML = "<p>No completed deals yet</p>";
      return;
    }

    deals.forEach(d => {

      container.innerHTML += `
        <div class="card">
          👨‍🌾 Farmer ID: ${d.farmerId}<br>
          📦 Quantity: ${d.quantity}<br>
          💰 Final Price: ₹${d.finalPrice}<br>
          🧾 Invoice: ${d.invoiceId || "-"}<br>
          📊 Payment: <span class="paid">${d.paymentStatus}</span>
        </div>
      `;
    });

  } catch (err) {
    console.log("Deal History Error:", err);
    container.innerHTML = "<p>Server error</p>";
  }
}

loadDeals();
f