document.getElementById("detectBtn").addEventListener("click", uploadImage);

async function uploadImage() {
  console.log("Button clicked ✅");

  const fileInput = document.getElementById("imageInput");
  const resultDiv = document.getElementById("result");

  if (!fileInput.files.length) {
    alert("Select image first");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  resultDiv.innerHTML = "Uploading... ⏳";

  try {
    const response = await fetch("https://shubhamjare05.app.n8n.cloud/webhook/d802b95a-f95b-4b12-aa15-d3210906acb8", {
      method: "POST",
      body: formData
    });

    const text = await response.text();

    console.log("RAW:", text);

    resultDiv.innerHTML = text || "No response ❌";

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "Request failed ❌";
  }
}