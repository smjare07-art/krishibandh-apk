let selectedPostId = null;
let selectedCompanyId = null;

const BASE_URL = "https://krishibandh-backend.onrender.com";

// ================= LOAD ALL POSTS =================
async function loadAllPosts() {
  try {
    const res = await fetch(`${BASE_URL}/posts`);
    const posts = await res.json();

    const container = document.getElementById("companyPosts");
    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = "<p>No posts available</p>";
      return;
    }

    posts.forEach(p => {
      container.innerHTML += `
        <div class="post-card" onclick="viewPost('${p._id}', '${p.companyId}')">
          <h4>🌾 ${p.crop}</h4>
          <p>📦 Quantity: ${p.quantity}</p>
          <p>💰 Price: ₹${p.price}</p>
          <p>🏢 Company: ${p.companyName}</p>
          ${p.image ? `<img src="${BASE_URL}/${p.image}" width="120">` : ""}
        </div>
      `;
    });

  } catch (err) {
    console.log("Error loading posts:", err);
  }
}

loadAllPosts();


// ================= VIEW POST =================
function viewPost(id, companyId) {

  selectedPostId = id;
  selectedCompanyId = companyId;

  fetch(`${BASE_URL}/posts`)
    .then(res => res.json())
    .then(posts => {

      const post = posts.find(p => p._id === id);
      if (!post) return;

      const detail = document.getElementById("postDetailView");

      detail.innerHTML = `
        <h4>🌾 ${post.crop}</h4>
        <p>📦 Quantity: ${post.quantity}</p>
        <p>💰 Price: ₹${post.price}</p>
        <p>🏢 Company: ${post.companyName}</p>
        ${post.image ? `<img src="${BASE_URL}/${post.image}" width="200">` : ""}
      `;

      document.getElementById("postModal").style.display = "flex";
    });
}


// ================= SUBMIT APPLICATION =================
async function submitApplication() {

  const quantity = document.getElementById("applyQty").value;
  const price = document.getElementById("applyPrice").value;
  const message = document.getElementById("applyMsg").value;
  const image = document.getElementById("applyImage").files[0];

  const farmerId = localStorage.getItem("userId");

  const formData = new FormData();
  formData.append("postId", selectedPostId);
  formData.append("companyId", selectedCompanyId);
  formData.append("farmerId", farmerId);
  formData.append("quantity", quantity);
  formData.append("price", price);
  formData.append("message", message);

  if (image) {
    formData.append("image", image);
  }

  await fetch(`${BASE_URL}/apply`, {
    method: "POST",
    body: formData
  });

  alert("Application Submitted");
  closeModal();
}


// ================= CLOSE MODAL =================
function closeModal() {
  document.getElementById("postModal").style.display = "none";
}


// ================= MAKE GLOBAL =================
window.viewPost = viewPost;
window.submitApplication = submitApplication;
window.closeModal = closeModal;
