// Splash screen → Language screen
setTimeout(() => {
  document.getElementById("splash").style.display = "none";
  document.getElementById("language").style.display = "block";
}, 3000);

// Language selection
function selectLang(lang) {
  localStorage.setItem("language", lang);
  window.location.href = "../html/login.html";
}
