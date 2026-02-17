async function loadUsers() {

  try {

    const res = await fetch("http://localhost:5000/admin/users");
    const users = await res.json();

    document.getElementById("totalUsers").innerText = users.length;

    const container = document.getElementById("userList");
    container.innerHTML = "";

    users.forEach(user => {

      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";
      div.style.borderRadius = "8px";

      div.innerHTML = `
        <b>Name:</b> ${user.username} <br>
        <b>Email:</b> ${user.email} <br>
        <b>Phone:</b> ${user.phone || "-"} <br>
        <b>Location:</b> ${user.village || ""}, ${user.district || ""}, ${user.state || ""} <br><br>
        <button onclick="deleteUser('${user._id}')"
          style="background:red;color:white;border:none;padding:6px 12px;border-radius:6px">
          Delete
        </button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.log(err);
  }
}


async function deleteUser(id) {

  if (!confirm("Delete this user?")) return;

  await fetch("http://localhost:5000/admin/user/" + id, {
    method: "DELETE"
  });

  loadUsers();
}

loadUsers();
