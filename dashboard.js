import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, update, onValue, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const db = firebase.database();
const auth = firebase.auth();

// -------------------- Auth Guard --------------------
auth.onAuthStateChanged(function(user) {
  if (user) {
    const uid = user.uid;
    db.ref('admins/' + uid).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Admin access granted");
        document.getElementById('admin-content').style.display = 'block';
        loadDashboardData(); // Load after auth
      } else {
        alert("You are not authorized!");
        window.location.href = "admin-login.html";
      }
    });
  } else {
    window.location.href = "admin-login.html";
  }
});

// -------------------- Admin Logout --------------------
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "admin-login.html";
  }).catch((error) => {
    alert("Logout failed: " + error.message);
  });
});

// -------------------- Dashboard Loader --------------------
function loadDashboardData() {
  const monthWiseUsers = {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0,
    Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
  };

  // --- Load Users Count & Chart ---
  db.ref("users").once("value", snapshot => {
    const users = snapshot.val();
    const count = users ? Object.keys(users).length : 0;
    document.getElementById("userCount").textContent = count;

    if (users) {
      Object.values(users).forEach(user => {
        const timestamp = user.createdAt || user.timestamp;
        if (timestamp) {
          const date = new Date(timestamp);
          const month = date.toLocaleString('default', { month: 'short' });
          if (monthWiseUsers[month] !== undefined) {
            monthWiseUsers[month]++;
          }
        }
      });
    }

    renderLineChart(monthWiseUsers);
  });

  // --- Load Transactions Data ---
  db.ref("transactions").once("value", snapshot => {
    let totalAmount = 0;
    let totalCount = 0;
    let success = 0, pending = 0, failed = 0;

    snapshot.forEach(child => {
      const tx = child.val();
      if (tx.amount) totalAmount += parseFloat(tx.amount);
      totalCount++;

      if (tx.status === "Success") success++;
      else if (tx.status === "Pending") pending++;
      else failed++;
    });

    document.getElementById("transactionCount").textContent = totalCount;
    document.getElementById("amountSum").textContent = "₹" + totalAmount.toLocaleString();
    renderPieChart(success, pending, failed);
  });
}

// -------------------- Chart Rendering --------------------
function renderLineChart(dataObj) {
  const labels = Object.keys(dataObj);
  const data = Object.values(dataObj);

  new Chart(document.getElementById('userChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Users by Month',
        data: data,
        backgroundColor: '#00ffe0',
        borderColor: '#00ffe0',
        fill: false
      }]
    },
    options: { responsive: true }
  });
}

function renderPieChart(success, pending, failed) {
  new Chart(document.getElementById('pieChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Success', 'Pending', 'Failed'],
      datasets: [{
        label: 'Transactions',
        data: [success, pending, failed],
        backgroundColor: ['#00ff95', '#ffaa00', '#ff005c']
      }]
    },
    options: { responsive: true }
  });
}
