const BASE_URL = "https://krishibandh-backend.onrender.com";

// ================= GET COMPANY ID =================
const companyId = localStorage.getItem("userId");

if (!companyId) {
  alert("Please login first");
  window.location.href = "company-login.html";
}

console.log("Company ID:", companyId);


// ================= CREATE POST =================
async function createPost() {

  const crop = document.getElementById("crop").value;
  const quantity = document.getElementById("quantity").value;
  const price = document.getElementById("price").value;
  const image = document.getElementById("image").files[0];

  if (!crop || !quantity || !price) {
    alert("All fields required");
    return;
  }

  const formData = new FormData();
  formData.append("companyId", companyId);
  formData.append("crop", crop);
  formData.append("quantity", quantity);
  formData.append("price", price);

  if (image) {
    formData.append("image", image);
  }

  const res = await fetch(`${BASE_URL}/company/post`, {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Post Created");
  loadPosts();
}


// ================= LOAD COMPANY POSTS =================
async function loadPosts() {

  try {

    const res = await fetch(
      `${BASE_URL}/company/posts/${companyId}`
    );

    if (!res.ok) {
      console.log("Route error:", res.status);
      return;
    }

    const posts = await res.json();

    const container = document.getElementById("postList");
    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = "<p>No posts found</p>";
      return;
    }

    posts.forEach(p => {

      container.innerHTML += `
        <div style="border:1px solid #333;padding:10px;margin:10px">
          🌾 ${p.crop}<br>
          📦 Quantity: ${p.quantity}<br>
          💰 Price: ₹${p.price}<br>
          ${p.image ? `<img src="${BASE_URL}/${p.image}" width="150">` : ""}
        </div>
      `;
    });

  } catch (err) {
    console.log("Load Posts Error:", err);
  }
}


// ================= LOAD APPLICATIONS =================
async function loadApplications() {

  const container = document.getElementById("applicationList");

  if (!container) {
    console.log("applicationList div not found in HTML");
    return;
  }

  try {

    const res = await fetch(
      `${BASE_URL}/company/applications/${companyId}`
    );

    if (!res.ok) {
      console.log("Applications route error:", res.status);
      return;
    }

    const applications = await res.json();

    container.innerHTML = "";

    if (applications.length === 0) {
      container.innerHTML = "<p>No applications yet</p>";
      return;
    }

    applications.forEach(a => {

      let color = "black";
      if (a.status === "accepted") color = "green";
      if (a.status === "rejected") color = "red";
      if (a.status === "bargaining") color = "orange";

      container.innerHTML += `
        <div style="border:1px solid #333;padding:10px;margin:10px">
          👨‍🌾 Farmer ID: ${a.farmerId}<br>
          📦 Quantity: ${a.quantity || "-"}<br>
          💰 Price: ₹${a.price || "-"}<br>
          💬 Message: ${a.message || "-"}<br>
          Status: <b style="color:${color}">${a.status || "pending"}</b><br><br>
          ${a.image ? `<img src="${BASE_URL}/${a.image}" width="150"><br><br>` : ""}

          <button onclick="updateStatus('${a._id}','accepted')" 
            style="background:green;color:white;margin-right:5px">
            Accept
          </button>

          <button onclick="updateStatus('${a._id}','rejected')" 
            style="background:red;color:white;margin-right:5px">
            Reject
          </button>

          <button onclick="updateStatus('${a._id}','bargaining')" 
            style="background:orange;color:white">
            Bargain
          </button>
        </div>
      `;
    });

  } catch (err) {
    console.log("Applications Error:", err);
  }
}


// ================= UPDATE APPLICATION STATUS =================
async function updateStatus(id, status) {

  if (status === "accepted") {

    const finalPrice = prompt("Enter Final Agreed Price:");
    if (!finalPrice) return;

    await fetch(`${BASE_URL}/application/status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status,
        finalPrice
      })
    });

    window.location.href = "payment.html?appId=" + id;

  } else {

    await fetch(`${BASE_URL}/application/status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    loadApplications();
  }
}


// ================= INIT =================
loadPosts();
loadApplications();
