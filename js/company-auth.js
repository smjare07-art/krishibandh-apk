// ================= COMPANY SIGNUP =================
async function signup() {

  const username = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://127.0.0.1:5000/company/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, phone, password })
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

  const res = await fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  console.log("LOGIN RESPONSE:", data);

  if (res.ok) {

  localStorage.setItem("userId", data.userId);
  localStorage.setItem("username", data.username);

  window.location.href = "company-dashboard.html";

} else {
  alert(data.message || "Login Failed");
}
}