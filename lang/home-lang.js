// ✅ SAFE global language code
window.langCode = localStorage.getItem("language") || "mr";

const HOME_TEXT = {
  mr: {
    greeting: "शुभ संध्याकाळ",
    companyReq: "कंपनीची आवश्यकता",
    cropAdvice: "पीक सल्ला",
    soilCard: "Under Deveploment",
    fertilizer: "Under Deveploment",
    climate: "हवामानानुकूल शेती",
    pest: "गोदाम",
    market: "बाजारभाव",
    history: "इतिहास",
    warehouse: "आमच्याशी संपर्क साधा",
    home: "होम",
    video: "व्हिडिओ",
    school: "शेतीशाळा",
    profile: "माझी प्रोफाइल",
    leaderboard: "लीडरबोर्ड",
    expense: "खर्च गणक",
    partner: "भागीदार",
    about: "आमच्याविषयी",
    logout: "बाहेर पडा",
    develop: ""
  },
  en: {
    greeting: "Good Evening",
    companyReq: "Company Requirement",
    cropAdvice: "Crop Advice",
    soilCard: "Under Deveploment",
    fertilizer: "Under Deveploment",
    climate: "Climate Smart Farming",
    pest: "Warehouse",
    market: "Market Rates",
    history: "History",
    warehouse: "conctat us",
    home: "Home",
    video: "Videos",
    school: "Agri School",
    profile: "My Profile",
    leaderboard: "Leaderboard",
    expense: "Expense Calculator",
    partner: "Partners",
    about: "About Us",
    logout: "Logout",
    develop: ""
  },
  hi: {
    greeting: "शुभ संध्या",
    companyReq: "कंपनी की आवश्यकता",
    cropAdvice: "फसल सलाह",
    soilCard: "Under Deveploment",
    fertilizer: "Under Deveploment",
    climate: "जलवायु अनुकूल खेती",
    pest: "गोदाम",
    market: "बाजार भाव",
    history: "इतिहास",
    warehouse: "हमसे संपर्क करें",
    home: "होम",
    video: "वीडियो",
    school: "कृषि पाठशाला",
    profile: "मेरी प्रोफाइल",
    leaderboard: "लीडरबोर्ड",
    expense: "खर्च गणक",
    partner: "साझेदार",
    about: "हमारे बारे में",
    logout: "लॉगआउट",
    develop: ""
  }
};

function formatWeatherDate() {
  return new Date().toLocaleDateString(
    window.langCode === "mr"
      ? "mr-IN"
      : window.langCode === "hi"
      ? "hi-IN"
      : "en-IN",
    { weekday: "long", day: "numeric", month: "long" }
  );
}

// 🌐 APPLY HOME LANGUAGE
window.applyHomeLanguage = function (username) {
  const t = HOME_TEXT[window.langCode];

  set("companyReq", t.companyReq);
  set("cropAdvice", t.cropAdvice);
  set("soilCard", t.soilCard);
  set("fertilizer", t.fertilizer);
  set("climate", t.climate);
  set("pest", t.pest);
  set("market", t.market);
  set("history", t.history);
  set("warehouse", t.warehouse);

  set("navHome", t.home);
  set("navVideo", t.video);
  set("navSchool", t.school);

  set("sbProfile", t.profile);
  set("sbLeaderboard", t.leaderboard);
  set("sbExpense", t.expense);
  set("sbPartner", t.partner);
  set("sbAbout", t.about);
  set("sbLogout", t.logout);
  set("develop", t.develop);

  set("weatherDate", formatWeatherDate());
};

function set(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}
