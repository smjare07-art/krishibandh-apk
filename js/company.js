const BASE_URL = "https://krishibandh-backend.onrender.com";

// ================= GET COMPANY ID =================
const companyId = localStorage.getItem("userId");

if (!companyId) {
  alert("Please login first");
  window.location.href = "company-login.html";
}

// ================= CREATE POST =================
async function createPost() {
  try {
    const crop = document.getElementById("crop").value.trim();
    const quantity = Number(document.getElementById("quantity").value);
    const price = document.getElementById("price").value.trim();
    const image = document.getElementById("image").files[0];

    if (!crop || !quantity || quantity <= 0 || !price) {
      alert("All fields required & quantity must be greater than 0");
      return;
    }

    const formData = new FormData();
    formData.append("companyId", companyId);
    formData.append("crop", crop);
    formData.append("quantity", quantity);
    formData.append("price", price);
    if (image) formData.append("image", image);

    const res = await fetch(`${BASE_URL}/company/post`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error creating post");
      return;
    }

    alert("Post Created ✅");
    loadPosts();

  } catch (err) {
    console.log("Create Post Error:", err);
    alert("Server error");
  }
}

// ================= LOAD COMPANY POSTS =================
async function loadPosts() {
  try {
    const res = await fetch(`${BASE_URL}/company/posts/${companyId}`);
    if (!res.ok) return;

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
          📦 Quantity Left: <b>${p.quantity}</b><br>
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
  if (!container) return;

  try {

    const res = await fetch(`${BASE_URL}/company/applications/${companyId}`);
    if (!res.ok) return;

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

      const isDisabled = a.status === "accepted" || a.status === "rejected";

      container.innerHTML += `
        <div style="border:1px solid #333;padding:10px;margin:10px">
          👨‍🌾 Farmer ID: ${a.farmerId}<br>
          📦 Requested Qty: ${a.quantity}<br>
          💰 Offered Price: ₹${a.price || "-"}<br>
          💬 Message: ${a.message || "-"}<br>
          Status: <b style="color:${color}">${a.status}</b><br><br>
          ${a.image ? `<img src="${BASE_URL}/${a.image}" width="150"><br><br>` : ""}

          <button id="accept-${a._id}" 
            onclick="updateStatus('${a._id}','accepted')" 
            ${isDisabled ? "disabled" : ""}
            style="background:green;color:white;margin-right:5px">
            Accept
          </button>

          <button id="reject-${a._id}" 
            onclick="updateStatus('${a._id}','rejected')" 
            ${isDisabled ? "disabled" : ""}
            style="background:red;color:white;margin-right:5px">
            Reject
          </button>

          <button id="bargain-${a._id}" 
            onclick="updateStatus('${a._id}','bargaining')" 
            ${isDisabled ? "disabled" : ""}
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

// ================= UPDATE STATUS =================
async function updateStatus(id, status) {

  try {

    // 🔥 Disable all buttons immediately
    document.getElementById("accept-" + id)?.setAttribute("disabled", true);
    document.getElementById("reject-" + id)?.setAttribute("disabled", true);
    document.getElementById("bargain-" + id)?.setAttribute("disabled", true);

    let bodyData = { status };

    if (status === "accepted") {
      const finalPrice = prompt("Enter Final Agreed Price:");
      if (!finalPrice) {
        loadApplications();
        return;
      }
      bodyData.finalPrice = finalPrice;
    }

    const res = await fetch(`${BASE_URL}/application/status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error updating status");
      loadApplications();
      return;
    }

    alert("Status Updated ✅");

    // 🔥 Reload everything
    loadPosts();
    loadApplications();

    if (status === "accepted") {
      window.location.href = "payment.html?appId=" + id;
    }

  } catch (err) {
    console.log("Update Status Error:", err);
    alert("Server error");
    loadApplications();
  }
}

// ================= INIT =================
loadPosts();
loadApplications();