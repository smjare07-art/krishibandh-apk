const BASE_URL = "https://krishibandh-backend.onrender.com";

// ================= COMPANY SIGNUP =================
async function signup() {

  const username = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value; // (optional)
  const password = document.getElementById("password").value;

  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) {
    window.location.href = "company-login.html";
  }
}


// ================= COMPANY LOGIN =================
async function login() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("username", data.username);
    localStorage.setItem("role", data.role);

    window.location.href = "company-dashboard.html";
  } else {
    alert(data.message || "Login Failed");
  }
}
