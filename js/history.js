const farmerId = localStorage.getItem("userId");
const list = document.getElementById("historyList");

async function loadAcceptedDeals() {

  const res = await fetch(
    "http://localhost:5000/farmer/applications/" + farmerId
  );

  const deals = await res.json();

  const completed = deals.filter(
    d => d.status === "accepted" && d.paymentStatus === "paid"
  );

  list.innerHTML = "";

  completed.forEach(d => {

    list.innerHTML += `
      <div class="card">
        <p class="ok">✔ Deal Completed</p>
        <p><b>Final Price:</b> ₹${d.finalPrice}</p>
        <p><b>Invoice:</b> ${d.invoiceId}</p>
      </div>
    `;
  });
}

loadAcceptedDeals();
