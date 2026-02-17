const lang = localStorage.getItem("language") || "mr";

const TEXT = {
  mr: { title: "Company Requirement" },
  en: { title: "Company Requirement" },
  hi: { title: "कंपनी आवश्यकताएं" }
};

document.getElementById("title").innerText = TEXT[lang].title;
