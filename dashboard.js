import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgjEBxPifW0W3o7CtLfRZ9mXnHoMbibao",
  authDomain: "mines-botai.firebaseapp.com",
  databaseURL: "https://mines-botai-default-rtdb.firebaseio.com",
  projectId: "mines-botai",
  storageBucket: "mines-botai.firebasestorage.app",
  messagingSenderId: "175710322906",
  appId: "1:175710322906:web:94470ebbc40336f6dfe5e3",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Auth Check
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    const adminRef = ref(db, 'admins/' + uid);
    get(adminRef).then((snapshot) => {
      if (snapshot.exists()) {
        document.getElementById('admin-content').style.display = 'block';
        loadDashboardData();
      } else {
        alert("You are not authorized!");
        window.location.href = "admin-login.html";
      }
    }).catch((error) => {
      console.error("Admin check failed:", error);
      window.location.href = "admin-login.html";
    });
  } else {
    window.location.href = "admin-login.html";
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "admin-login.html";
  }).catch((error) => {
    alert("Logout failed: " + error.message);
  });
});

// Load Dashboard
function loadDashboardData() {
  const monthWiseUsers = {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0,
    Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
  };

  // Load Users
  const usersRef = ref(db, "users");
  onValue(usersRef, (snapshot) => {
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
  }, { onlyOnce: true });

  // Load Transactions
  const transactionsRef = ref(db, "transactions");
  onValue(transactionsRef, (snapshot) => {
    let totalAmount = 0;
    let totalCount = 0;
    let success = 0, pending = 0, failed = 0;

    snapshot.forEach((child) => {
      const tx = child.val();
      if (tx.amount) totalAmount += parseFloat(tx.amount || 0);
      totalCount++;
      if (tx.status === "Success") success++;
      else if (tx.status === "Pending") pending++;
      else failed++;
    });

    document.getElementById("transactionCount").textContent = totalCount;
    document.getElementById("amountSum").textContent = "₹" + totalAmount.toLocaleString();
    renderPieChart(success, pending, failed);
  }, { onlyOnce: true });
}

// Charts
function renderLineChart(dataObj) {
  const canvas = document.getElementById('userChart');
  if (!canvas) return;

  const labels = Object.keys(dataObj);
  const data = Object.values(dataObj);

  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Users by Month',
        data,
        backgroundColor: '#00ffe0',
        borderColor: '#00ffe0',
        fill: false
      }]
    },
    options: { responsive: true }
  });
}

function renderPieChart(success, pending, failed) {
  const canvas = document.getElementById('pieChart');
  if (!canvas) return;

  new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Success', 'Pending', 'Failed'],
      datasets: [{
        data: [success, pending, failed],
        backgroundColor: ['#00ff95', '#ffaa00', '#ff005c']
      }]
    },
    options: { responsive: true }
  });
}


document.addEventListener('DOMContentLoaded', function() {
      // User Growth Chart
      const userCtx = document.getElementById('userChart').getContext('2d');
      const userChart = new Chart(userCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'New Users',
            data: [120, 190, 170, 220, 260, 300],
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            borderColor: 'rgba(67, 97, 238, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      // Pie Chart
      const pieCtx = document.getElementById('pieChart').getContext('2d');
      const pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Pending', 'Failed'],
          datasets: [{
            data: [300, 50, 20],
            backgroundColor: [
              'rgba(76, 201, 240, 0.8)',
              'rgba(248, 150, 30, 0.8)',
              'rgba(247, 37, 133, 0.8)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            }
          },
          cutout: '70%'
        }
      });

      // Sample data for cards
      document.getElementById('userCount').textContent = '1,248';
      document.getElementById('transactionCount').textContent = '370';
      document.getElementById('amountSum').textContent = '₹84,560';

      // Logout button
      document.getElementById('logoutBtn').addEventListener('click', function() {
        showToast('Logout successful!');
        // Add actual logout logic here
      });
    });

    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.className = 'toast-success';
      toast.querySelector('.toast-icon').className = 'fas fa-check-circle toast-icon';
      toast.querySelector('.toast-content').textContent = message;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
