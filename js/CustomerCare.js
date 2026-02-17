function submitTicket() {
  const issueType = document.getElementById("issueType").value;
  const issueText = document.getElementById("issueText").value;

  if (!issueType || !issueText.trim()) {
    alert("कृपया सर्व माहिती भरा");
    return;
  }

  const message =
`नमस्कार 🙏

तक्रार नोंदवली गेली आहे ✅

🔹 तक्रार प्रकार: ${issueType}
🔹 तक्रार तपशील:
${issueText}

कृपया लवकरात लवकर मदत करा.
धन्यवाद 🙏`;

  const encodedMessage = encodeURIComponent(message);

  const whatsappNumber = "+6283163861179"; // + काढलेला
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  // WhatsApp Open
  window.open(whatsappURL, "_blank");

  // Clear form
  document.getElementById("issueType").value = "";
  document.getElementById("issueText").value = "";
}

function openChat() {
  alert("Live Chat लवकरच उपलब्ध होईल 💬");
}
