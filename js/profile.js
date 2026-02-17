// ================= LOGOUT =================
window.logout = function () {
  localStorage.clear();
  window.location.href = "index.html";
};

// ================= LOAD PROFILE =================
document.addEventListener("DOMContentLoaded", async function () {

  var userId = localStorage.getItem("userId");

  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  try {

    var res = await fetch("http://localhost:5000/user/" + userId);

    if (!res.ok) {
      console.log("User fetch failed");
      return;
    }

    var user = await res.json();

    document.getElementById("pName").innerText = user.username || "-";
    document.getElementById("pEmail").innerText = user.email || "-";
    document.getElementById("pPhone").innerText = user.phone || "-";

    // Location Format
    var locationText = "-";

    if (user.state || user.district || user.village) {
      locationText =
        (user.village || "") +
        ", " +
        (user.district || "") +
        ", " +
        (user.state || "");

      locationText = locationText.replace(/^, |, $/g, "").replace(/, ,/g, ",");
    }

    document.getElementById("pLocation").innerText = locationText;

  } catch (err) {
    console.log("Profile load error:", err);
  }

});
