const lang = localStorage.getItem("language") || "mr";

const text = {
  mr: {
    title: "🏬 माझे गोदाम",
    addTitle: "गोदामात पीक जोडा",
    crop: "पिकाचे नाव",
    quantity: "प्रमाण (क्विंटल)",
    cold: "थंड साठवण",
    dry: "कोरडी साठवण",
    addBtn: "➕ जोडा",
    stored: "📦 साठवलेली पिके",
    loading: "लोड होत आहे..."
  },
  en: {
    title: "🏬 My Warehouse",
    addTitle: "Add Crop to Warehouse",
    crop: "Crop Name",
    quantity: "Quantity (Quintal)",
    cold: "Cold Storage",
    dry: "Dry Storage",
    addBtn: "➕ Add",
    stored: "📦 Stored Items",
    loading: "Loading..."
  },
  hi: {
    title: "🏬 मेरा गोदाम",
    addTitle: "गोदाम में फसल जोड़ें",
    crop: "फसल का नाम",
    quantity: "मात्रा (क्विंटल)",
    cold: "कोल्ड स्टोरेज",
    dry: "सूखा भंडारण",
    addBtn: "➕ जोड़ें",
    stored: "📦 संग्रहित फसलें",
    loading: "लोड हो रहा है..."
  }
};

// Apply language
document.getElementById("titleText").innerText = text[lang].title;
document.getElementById("addTitleText").innerText = text[lang].addTitle;
document.getElementById("cropName").placeholder = text[lang].crop;
document.getElementById("quantity").placeholder = text[lang].quantity;
document.getElementById("coldOpt").innerText = text[lang].cold;
document.getElementById("dryOpt").innerText = text[lang].dry;
document.getElementById("addBtn").innerText = text[lang].addBtn;
document.getElementById("storedTitleText").innerText = text[lang].stored;
document.getElementById("warehouseList").innerText = text[lang].loading;
