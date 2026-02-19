const BASE_URL = "https://krishibandh-backend.onrender.com";

const farmerId = localStorage.getItem("userId");

if (!farmerId) {
  alert("Please login first");
  window.location.href = "index.html";
}

async function loadMyApplications() {

  const container = document.getElementById("myApplications");
  if (!container) return;

  try {

    const res = await fetch(
      `${BASE_URL}/farmer/applications/${farmerId}`
    );

    if (!res.ok) {
      console.log("Route error:", res.status);
      container.innerHTML = "<p>Error loading applications</p>";
      return;
    }

    const applications = await res.json();

    container.innerHTML = "";

    if (!applications || applications.length === 0) {
      container.innerHTML = "<p>No applications yet</p>";
      return;
    }

    applications.forEach(a => {

      let statusText = (a.status || "Pending").toLowerCase();
      let color = "gray";

      if (statusText === "accepted") color = "green";
      if (statusText === "rejected") color = "red";
      if (statusText === "bargaining") color = "orange";

      container.innerHTML += `
        <div style="border:1px solid #333;padding:15px;margin:15px;border-radius:10px">
          🏢 Company: ${a.companyName || "-"}<br>
          📦 Quantity: ${a.quantity || "-"}<br>
          💰 Price: ₹${a.price || "-"}<br>
          💬 Message: ${a.message || "-"}<br>
          📊 Status: <b style="color:${color}">
            ${a.status || "Pending"}
          </b><br><br>
          ${a.image ? `<img src="${BASE_URL}/${a.image}" width="150">` : ""}
        </div>
      `;
    });

  } catch (err) {
    console.log("Farmer Applications Error:", err);
    container.innerHTML = "<p>Server error</p>";
  }
}

loadMyApplications();
