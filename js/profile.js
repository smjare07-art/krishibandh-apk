const BASE_URL = "https://krishibandh-backend.onrender.com";

// ================= LOGOUT =================
function logout(){
  localStorage.clear();
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", async function(){

  const userId = localStorage.getItem("userId");

  if(!userId){
    window.location.href = "index.html";
    return;
  }

  try{

    const res = await fetch(`${BASE_URL}/user/${userId}`);

    if(!res.ok){
      throw new Error("User fetch failed");
    }

    const user = await res.json();

    // ===== USER DATA =====
    document.getElementById("pName").innerText = user.username || "-";
    document.getElementById("pEmail").innerText = user.email || "-";
    document.getElementById("pPhone").innerText = user.phone || "-";
    document.getElementById("pRole").innerText = user.role || "-";

    const locationText =
      `${user.village || ""}, ${user.district || ""}, ${user.state || ""}`
        .replace(/^, |, $/g,"")
        .replace(/, ,/g,",")
        .trim();

    document.getElementById("pLocation").innerText = locationText || "-";

    // ===== PROFILE IMAGE =====
    if(user.profileImage){
      document.getElementById("pImage").src =
        `${BASE_URL}/${user.profileImage}`;
    }

    // ================= MAP SECTION =================
    if(locationText){

      // Ensure map div has height (safety)
      const mapDiv = document.getElementById("map");
      mapDiv.style.height = "300px";
      mapDiv.style.width = "100%";

      console.log("Searching Location:", locationText);

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}`,
        { headers: { "Accept": "application/json" } }
      );

      const geoData = await geoRes.json();

      if(geoData && geoData.length > 0){

        const lat = parseFloat(geoData[0].lat);
        const lon = parseFloat(geoData[0].lon);

        // Small delay to ensure DOM ready
        setTimeout(() => {

          if(!window.profileMap){

            window.profileMap = L.map('map').setView([lat, lon], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap'
            }).addTo(window.profileMap);

            L.marker([lat, lon]).addTo(window.profileMap)
              .bindPopup("Farmer Location")
              .openPopup();
          }

        }, 300);

      } else {
        console.log("Location not found in OpenStreetMap");
      }
    }

  }catch(err){
    console.log("Profile load error:", err);
  }

});