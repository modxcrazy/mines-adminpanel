// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "https://YOUR_DB.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const userCountEl = document.getElementById("userCount");
const txnCountEl = document.getElementById("txnCount");
const txnAmountEl = document.getElementById("txnAmount");

onValue(ref(db, 'users'), (snapshot) => {
  const users = snapshot.val();
  userCountEl.innerText = users ? Object.keys(users).length : 0;
});

onValue(ref(db, 'transactions'), (snapshot) => {
  const txns = snapshot.val();
  let count = 0;
  let totalAmount = 0;

  if (txns) {
    count = Object.keys(txns).length;
    Object.values(txns).forEach(txn => {
      totalAmount += parseFloat(txn.amount || 0);
    });
  }

  txnCountEl.innerText = count;
  txnAmountEl.innerText = `₹${totalAmount.toFixed(2)}`;
});
