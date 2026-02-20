const BASE_URL = "https://krishibandh-backend.onrender.com";

async function loadUsers() {

  try {

    const res = await fetch(`${BASE_URL}/admin/users`);

    if (!res.ok) {
      throw new Error("Failed to load users");
    }

    const users = await res.json();

    document.getElementById("totalUsers").innerText = users.length;

    const container = document.getElementById("userList");
    container.innerHTML = "";

    if (!users.length) {
      container.innerHTML = "<p>No users found</p>";
      return;
    }

    users.forEach(user => {

      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";
      div.style.borderRadius = "8px";

      div.innerHTML = `
        <b>Name:</b> ${user.username || "-"} <br>
        <b>Email:</b> ${user.email || "-"} <br>
        <b>Phone:</b> ${user.phone || "-"} <br>
        <b>Location:</b> 
          ${user.village || ""} 
          ${user.district ? ", " + user.district : ""} 
          ${user.state ? ", " + user.state : ""} 
        <br><br>
        <button onclick="deleteUser('${user._id}')"
          style="background:red;color:white;border:none;padding:6px 12px;border-radius:6px">
          Delete
        </button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.log("Admin Load Error:", err);
    document.getElementById("userList").innerHTML =
      "<p>Server error</p>";
  }
}


async function deleteUser(id) {

  if (!confirm("Delete this user?")) return;

  try {

    const res = await fetch(`${BASE_URL}/admin/user/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    loadUsers();

  } catch (err) {
    console.log("Delete Error:", err);
    alert("Failed to delete user");
  }
}

loadUsers();