const WEATHER_API_KEY = "ac6edff3239d192fae15d39ae6403ee4";

let rainChart;
let currentTemp = 0;
let currentRain = 0;

/* 🌦 ICON PATH FIXED */
function getIcon(condition) {

  condition = condition.toLowerCase();

  if (condition.includes("clear")) return "../img/weather/sun.png";
  if (condition.includes("cloud")) return "../img/weather/cloud.png";
  if (condition.includes("rain")) return "../img/weather/rain.png";
  if (condition.includes("thunder")) return "../img/weather/thunder.png";
  if (condition.includes("snow")) return "../img/weather/snow.png";

  return "../img/weather/cloud.png";
}

/* 🌾 CROP ADVICE */
function cropAdvice(crop, temp, rain) {

  const tips = [];

  if (crop === "cotton") {
    if (temp > 35) tips.push("🌞 कापूस – उष्णता जास्त, सिंचन वाढवा");
    if (rain > 10) tips.push("🌧 कापूस – पाणी साचू देऊ नका");
  }

  if (crop === "soybean") {
    if (rain < 5) tips.push("💧 सोयाबीन – ओलावा कमी, सिंचन गरजेचे");
  }

  if (crop === "wheat") {
    if (temp > 30) tips.push("⚠️ गहू – उष्णतेपासून संरक्षण करा");
  }

  if (crop === "rice") {
    tips.push("🌾 भात – शेतात पाण्याची पातळी ठेवा");
  }

  if (tips.length === 0) {
    tips.push("✅ आज पिकासाठी अनुकूल हवामान");
  }

  return tips;
}

/* 📊 RAIN GRAPH */
function drawRainGraph(days, rainData) {

  const canvas = document.getElementById("rainChart");
  if (!canvas || typeof Chart === "undefined") return;

  const ctx = canvas.getContext("2d");

  if (rainChart) rainChart.destroy();

  rainChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: days,
      datasets: [{
        label: "Rainfall (mm)",
        data: rainData
      }]
    },
    options: {
      responsive: true
    }
  });
}

/* 🌍 LOAD WEATHER */
navigator.geolocation.getCurrentPosition(async function (pos) {

  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  /* 🌦 CURRENT WEATHER */
  const resCurrent = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
  );

  const current = await resCurrent.json();

  document.getElementById("city").innerText =
    current.name || "आपले स्थान";

  document.getElementById("temp").innerText =
    Math.round(current.main.temp) + "°C";

  document.getElementById("desc").innerText =
    current.weather[0].description;

  document.getElementById("icon").innerHTML =
    `<img src="${getIcon(current.weather[0].main)}" width="60">`;

  currentTemp = current.main.temp;

  /* 📆 FORECAST */
  const resForecast = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
  );

  const forecast = await resForecast.json();

  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";

  const dayMap = {};

  forecast.list.forEach(function (item) {

    const day = new Date(item.dt * 1000).toDateString();

    if (!dayMap[day]) {
      dayMap[day] = { rain: 0, temp: item.main.temp };
    }

    dayMap[day].rain += item.rain?.["3h"] || 0;
  });

  const days = [];
  const rainArr = [];

  Object.keys(dayMap).slice(0, 7).forEach(function (day) {

    forecastDiv.innerHTML += `
      <div>📅 ${day} | 🌡 ${Math.round(dayMap[day].temp)}°C | 🌧 ${dayMap[day].rain.toFixed(1)} mm</div>
    `;

    days.push(day);
    rainArr.push(Number(dayMap[day].rain.toFixed(1)));
  });

  currentRain = rainArr[0] || 0;

  drawRainGraph(days, rainArr);

  showCropAdvice("cotton");

});

/* 🌾 CHIP BUTTON CLICK */
function showCropAdvice(crop) {

  const tips = cropAdvice(crop, currentTemp, currentRain);

  const ul = document.getElementById("advice");
  ul.innerHTML = "";

  tips.forEach(function (tip) {
    ul.innerHTML += `<li>${tip}</li>`;
  });
}
