const lang = localStorage.getItem("language") || "en";

const text = {
  en: {
    aboutTitle: "About Us",
    aboutText: "KrishiBandh is a digital agricultural platform developed to establish a direct and transparent connection between farmers and companies. The platform aims to overcome inefficiencies in the traditional agricultural supply chain by eliminating unnecessary intermediaries and enabling fair, secure, and efficient trade. KrishiBandh promotes price transparency, improves market accessibility, and supports sustainable agricultural practices.",
    
    visionTitle: "Our Vision",
    visionText: "Our vision is to build a digitally empowered agricultural ecosystem where farmers receive fair value for their produce and companies gain direct access to quality agricultural products. Technology will drive transparency, trust, and sustainability.",
    
    offerTitle: "What We Offer",
    offerList: [
      "Direct farmer-to-company connectivity",
      "Transparent and fair pricing mechanisms",
      "Secure and simplified digital transactions",
      "Real-time communication",
      "Reduced dependency on middlemen",
      "Improved market access",
      "Efficient procurement solutions"
    ],
    
    goalTitle: "Our Goal",
    goalList: [
      "Eliminate exploitation by intermediaries",
      "Ensure fair income for farmers",
      "Create transparent supply chain",
      "Promote digital inclusion",
      "Support sustainable agricultural growth"
    ]
  },

  mr: {
    aboutTitle: "आमच्याबद्दल",
    aboutText: "KrishiBandh हे शेतकरी आणि कंपन्यांमध्ये थेट आणि पारदर्शक संबंध निर्माण करणारे डिजिटल कृषी व्यासपीठ आहे. हे पारंपरिक पुरवठा साखळीतील अडथळे दूर करून योग्य, सुरक्षित आणि कार्यक्षम व्यापार सुनिश्चित करते.",
    
    visionTitle: "आमचे दृष्टीकोन",
    visionText: "शेतकऱ्यांना त्यांच्या उत्पादनाला योग्य मूल्य मिळावे आणि कंपन्यांना दर्जेदार कृषी उत्पादने थेट मिळावीत असा आमचा उद्देश आहे.",
    
    offerTitle: "आमच्या सेवा",
    offerList: [
      "शेतकरी ते कंपनी थेट संपर्क",
      "पारदर्शक आणि योग्य दर",
      "सुरक्षित डिजिटल व्यवहार",
      "रिअल-टाइम संवाद",
      "मध्यस्थांवर अवलंबित्व कमी",
      "बाजारपेठेपर्यंत प्रवेश",
      "कंपन्यांसाठी सोपी खरेदी"
    ],
    
    goalTitle: "आमचे ध्येय",
    goalList: [
      "मध्यस्थांमुळे होणारे शोषण थांबवणे",
      "शेतकऱ्यांना योग्य उत्पन्न",
      "पारदर्शक पुरवठा साखळी",
      "ग्रामीण भागात डिजिटल समावेश",
      "शाश्वत कृषी विकास"
    ]
  },

  hi: {
    aboutTitle: "हमारे बारे में",
    aboutText: "KrishiBandh एक डिजिटल कृषि प्लेटफॉर्म है जो किसानों और कंपनियों को सीधे और पारदर्शी तरीके से जोड़ता है। यह पारंपरिक आपूर्ति श्रृंखला की समस्याओं को समाप्त करता है।",
    
    visionTitle: "हमारा दृष्टिकोण",
    visionText: "हम एक ऐसा डिजिटल कृषि पारिस्थितिकी तंत्र बनाना चाहते हैं जहां किसानों को उचित मूल्य और कंपनियों को गुणवत्ता उत्पाद मिलें।",
    
    offerTitle: "हम क्या प्रदान करते हैं",
    offerList: [
      "किसान से कंपनी सीधा संपर्क",
      "पारदर्शी मूल्य निर्धारण",
      "सुरक्षित डिजिटल लेनदेन",
      "रियल-टाइम संवाद",
      "बिचौलियों पर निर्भरता कम",
      "बेहतर बाजार पहुंच",
      "कुशल खरीद समाधान"
    ],
    
    goalTitle: "हमारा लक्ष्य",
    goalList: [
      "बिचौलियों का शोषण खत्म करना",
      "किसानों की आय बढ़ाना",
      "पारदर्शी आपूर्ति श्रृंखला",
      "डिजिटल समावेशन",
      "सतत कृषि विकास"
    ]
  }
};

// Apply language
document.getElementById("aboutTitle").innerText = text[lang].aboutTitle;
document.getElementById("aboutText").innerText = text[lang].aboutText;
document.getElementById("visionTitle").innerText = text[lang].visionTitle;
document.getElementById("visionText").innerText = text[lang].visionText;
document.getElementById("offerTitle").innerText = text[lang].offerTitle;
document.getElementById("goalTitle").innerText = text[lang].goalTitle;

// Lists
const offerList = document.getElementById("offerList");
text[lang].offerList.forEach(item => {
  const li = document.createElement("li");
  li.innerText = item;
  offerList.appendChild(li);
});

const goalList = document.getElementById("goalList");
text[lang].goalList.forEach(item => {
  const li = document.createElement("li");
  li.innerText = item;
  goalList.appendChild(li);
});
