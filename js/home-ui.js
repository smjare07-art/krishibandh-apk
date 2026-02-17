const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

window.openSidebar = function () {
  sidebar.classList.add("open");
  overlay.style.display = "block";
};

window.closeSidebar = function () {
  sidebar.classList.remove("open");
  overlay.style.display = "none";
};

window.go = page => location.href = page;


// GREETING
(function(){
  const h = new Date().getHours();
  let g = "Good Night";
  if(h>=5 && h<12) g="Good Morning";
  else if(h<16) g="Good Afternoon";
  else if(h<21) g="Good Evening";
  document.getElementById("greeting").innerText = g + ", ";
})();
(function () {
  const page = location.pathname.split("/").pop();

  const map = {
    "profile.html": "sbProfile",
    "aboutus.html": "sbAbout",
  };

  const activeId = map[page];
  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) el.classList.add("active");
  }
})();
document.addEventListener("click", function (e) {
  const target = e.target.closest(
    ".card, .sidebar .menu li, .bottom-nav div"
  );

  if (!target) return;

  const rect = target.getBoundingClientRect();
  const circle = document.createElement("span");
  const diameter = Math.max(target.clientWidth, target.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  const ripple = target.querySelector(".ripple");
  if (ripple) ripple.remove();

  target.appendChild(circle);
});
