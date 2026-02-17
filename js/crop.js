let model;

// 🧠 Disease labels (model training प्रमाणे)
const classes = [
  "Healthy",
  "Leaf Blight",
  "Leaf Spot",
  "Rust"
];

// 🚀 Load TensorFlow.js model
async function loadModel() {
  document.getElementById("loading").innerText = "⏳ AI Model लोड होत आहे...";
  document.getElementById("loading").style.display = "block";

  model = await tf.loadLayersModel("../model/model.json");

  document.getElementById("loading").style.display = "none";
  console.log("✅ Crop AI Model Loaded");
}
loadModel();

// 📷 Image preview
document.getElementById("cropImage").addEventListener("change", (e) => {
  const img = document.getElementById("preview");
  img.src = URL.createObjectURL(e.target.files[0]);
  img.style.display = "block";

  document.getElementById("result").innerText = "";
  document.getElementById("suggestion").innerText = "";
});

// 🔍 Predict disease
async function predictCrop() {
  if (!model) {
    alert("AI model अजून लोड होत आहे");
    return;
  }

  const img = document.getElementById("preview");
  if (!img.src) {
    alert("कृपया फोटो अपलोड करा");
    return;
  }

  document.getElementById("loading").innerText = "🔍 तपासणी चालू आहे...";
  document.getElementById("loading").style.display = "block";

  const tensor = tf.browser
    .fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims()
    .div(255.0);

  const prediction = model.predict(tensor);
  const index = prediction.argMax(-1).dataSync()[0];
  const disease = classes[index];

  document.getElementById("loading").style.display = "none";
  document.getElementById("result").innerText = "🦠 रोग: " + disease;
  document.getElementById("suggestion").innerText = getSuggestion(disease);
}

// 🌾 Marathi suggestions (REALISTIC)
function getSuggestion(disease) {
  switch (disease) {
    case "Healthy":
      return "✅ पीक निरोगी आहे. कोणतीही फवारणी आवश्यक नाही.";

    case "Leaf Blight":
      return "⚠️ पान करपा आढळला आहे. मॅन्कोझेब 2.5 ग्रॅम/लिटर फवारणी करा.";

    case "Leaf Spot":
      return "⚠️ पानावरील डाग रोग. कॉपर ऑक्सीक्लोराइड वापरा.";

    case "Rust":
      return "⚠️ तांबेरा रोग. ट्रायडिमेफॉन किंवा हेक्झाकोनाझोल फवारणी करा.";

    default:
      return "सल्ल्यासाठी कृषी अधिकाऱ्यांचा सल्ला घ्या.";
  }
}
