// ================= GET COMPANY ID =================
const companyId = localStorage.getItem("userId");

if (!companyId) {
  window.location.href = "company-login.html";
}


// ================= LOAD MANDI RATES =================
async function loadMandi() {

  try {

    const res = await fetch(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001343c9c4cc0464bb66221e639d0cc6174&format=json&limit=10"
    );

    const data = await res.json();

    const container = document.getElementById("mandiRates");
    container.innerHTML = "";

    data.records.forEach(r => {
      container.innerHTML += `
        <div style="border:1px solid #ccc;padding:10px;margin:5px">
          🌾 ${r.commodity} - ₹${r.max_price}
        </div>
      `;
    });

  } catch (err) {
    console.log(err);
  }
}


// ================= CREATE POST =================
async function createPost() {

  const crop = document.getElementById("crop").value;
  const quantity = document.getElementById("quantity").value;
  const price = document.getElementById("price").value;

  if (!crop || !quantity || !price) {
    alert("All fields required");
    return;
  }

  await fetch("http://localhost:5000/company/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyId,
      crop,
      quantity,
      price
    })
  });

  alert("Post Created");
  loadPosts();
}


// ================= LOAD COMPANY POSTS =================
async function loadPosts() {

  try {

    const res = await fetch(
      "http://localhost:5000/company/posts/" + companyId
    );

    const posts = await res.json();

    const container = document.getElementById("postList");
    container.innerHTML = "";

    posts.forEach(p => {

      container.innerHTML += `
        <div style="border:1px solid #333;padding:10px;margin:10px">
          🌾 ${p.crop}<br>
          📦 Quantity: ${p.quantity}<br>
          💰 Price: ₹${p.price}
        </div>
      `;
    });

  } catch (err) {
    console.log(err);
  }
}


// ================= INIT =================
loadMandi();
loadPosts();
