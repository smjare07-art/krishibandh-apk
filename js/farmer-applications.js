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
      "http://localhost:5000/farmer/applications/" + farmerId
    );

    if (!res.ok) {
      console.log("Route error:", res.status);
      return;
    }

    const applications = await res.json();

    container.innerHTML = "";

    if (applications.length === 0) {
      container.innerHTML = "<p>No applications yet</p>";
      return;
    }

    applications.forEach(a => {

      let color = "gray";

      if (a.status === "Accepted") color = "green";
      if (a.status === "Rejected") color = "red";
      if (a.status === "Bargaining") color = "orange";

     container.innerHTML += `
  <div style="border:1px solid #333;padding:15px;margin:15px;border-radius:10px">
    🏢 Company: ${a.companyName}<br>
    📦 Quantity: ${a.quantity || "-"}<br>
    💰 Price: ₹${a.price || "-"}<br>
    💬 Message: ${a.message || "-"}<br>
    📊 Status: <b style="color:${color}">
      ${a.status || "Pending"}
    </b><br><br>
    ${a.image ? `<img src="http://localhost:5000/${a.image}" width="150">` : ""}
  </div>
`;

    });

  } catch (err) {
    console.log("Farmer Applications Error:", err);
  }
}

loadMyApplications();
