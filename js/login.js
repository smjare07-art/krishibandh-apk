
// ================= POPUP =================
function showPopup(msg) {
  document.getElementById("popupText").innerText = msg;
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

window.closePopup = closePopup;


// ================= LOGIN =================
window.login = async function () {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showPopup("Email and Password required");
    return;
  }

  try {

    const res = await fetch("https://krishibandh-backend.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    console.log("Login Response:", data);

    if (res.ok) {

      // ✅ Only save what backend sends
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);

      showPopup("Login Successful");

      setTimeout(() => {
        window.location.href = "home.html";
      }, 800);

    } else {
      showPopup(data.message || "Login Failed");
    }

  } catch (err) {
    console.error("Login Error:", err);
    showPopup("Server Error");
  }
};
