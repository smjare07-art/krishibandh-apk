const lang = localStorage.getItem("language") || "mr";

const text = {
  mr: {
    title: "स्वागत आहे",
    email: "ईमेल",
    password: "पासवर्ड",
    login: "लॉगिन",
    signup: "नोंदणी",
    forgot: "पासवर्ड विसरलात?"
  },
  en: {
    title: "Login",
    email: "Email",
    password: "Password",
    login: "Login",
    signup: "Signup",
    forgot: "Forgot Password"
  },
  hi: {
    title: "लॉगिन",
    email: "ईमेल",
    password: "पासवर्ड",
    login: "लॉगिन",
    signup: "साइन अप",
    forgot: "पासवर्ड भूल गए?"
  }
};

document.getElementById("titleText").innerText = text[lang].title;
document.getElementById("email").placeholder = text[lang].email;
document.getElementById("password").placeholder = text[lang].password;
document.getElementById("loginBtn").innerText = text[lang].login;
document.getElementById("signupText").innerText = text[lang].signup;
document.getElementById("forgotText").innerText = text[lang].forgot;
