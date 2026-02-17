// =========================
// 📍 PINCODE LOCATION LOGIC
// =========================

const PIN_API = "https://api.postalpincode.in/pincode/";

const pincodeInput = document.getElementById("pincode");
const stateInput = document.getElementById("state");
const districtInput = document.getElementById("district");
const villageSelect = document.getElementById("village");

pincodeInput.addEventListener("keyup", async () => {
  if (pincodeInput.value.length !== 6) return;

  villageSelect.innerHTML = "<option>Loading...</option>";

  try {
    const res = await fetch(PIN_API + pincodeInput.value);
    const data = await res.json();

    if (data[0].Status !== "Success") {
      alert("Invalid Pincode");
      villageSelect.innerHTML = "<option>Select Village</option>";
      return;
    }

    const postOffices = data[0].PostOffice;

    stateInput.value = postOffices[0].State;
    districtInput.value = postOffices[0].District;

    villageSelect.innerHTML = "<option value=''>Select Village</option>";

    postOffices.forEach(po => {
      const opt = document.createElement("option");
      opt.value = po.Name;
      opt.textContent = po.Name;
      villageSelect.appendChild(opt);
    });

  } catch (err) {
    alert("Error fetching location");
  }
});


// =========================
// 🔐 SIGNUP FUNCTION (MongoDB Backend)
// =========================

window.signup = async function () {

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const pincode = pincodeInput.value.trim();
  const state = stateInput.value.trim();
  const district = districtInput.value.trim();
  const village = villageSelect.value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!username || !email || !password || !pincode || !village) {
    alert("All fields required");
    return;
  }

  if (password !== confirmPassword) {
    alert("Password mismatch");
    return;
  }

  try {

    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        phone,
        pincode,
        state,
        district,
        village,
        password
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Signup Successful");
      window.location.href = "index.html";
    } else {
      alert(data.message);
    }

  } catch (err) {
    alert("Server Error");
  }
};
