const senderId = localStorage.getItem("userId");
const receiverId = new URLSearchParams(window.location.search).get("id");

async function loadChat() {

  const res = await fetch(
    `http://localhost:5000/chat/${senderId}/${receiverId}`
  );

  const messages = await res.json();

  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";

  messages.forEach(msg => {

    const div = document.createElement("div");

    div.classList.add("message");

    if (msg.senderId === senderId) {
      div.classList.add("sent");
    } else {
      div.classList.add("received");
    }

    div.innerText = msg.message;

    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {

  const input = document.getElementById("msgInput");
  const message = input.value;

  if (!message) return;

  await fetch("http://localhost:5000/chat/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId,
      receiverId,
      message
    })
  });

  input.value = "";
  loadChat();
}

setInterval(loadChat, 2000);
loadChat();
