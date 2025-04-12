const db = firebase.database();
const auth = firebase.auth();

// -------------------- Auth Guard --------------------
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    const uid = user.uid;
    firebase.database().ref('admins/' + uid).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Admin access granted");
        // Show admin content
        document.getElementById('admin-content').style.display = 'block';
      } else {
        console.log("Admin access denied");
        alert("You are not authorized!");
        window.location.href = "admin-login.html"; // ya login page
      }
    });
  } else {
    window.location.href = "login.html";
  }
});

//---------- Admin Logout --------
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "admin-login.html";
  }).catch((error) => {
    alert("Logout failed: " + error.message);
  });
});

// (Optional) Function to fetch user count via Firebase Auth – not used later on
firebase.auth().listUsers = async function () {
  const usersRef = firebase.database().ref("users");
  const snapshot = await usersRef.once("value");
  return Object.keys(snapshot.val() || {}).length;
};

async function loadDashboardData() {
  // Fetch total users from /users
  const usersRef = db.ref("users");
  usersRef.once("value", snapshot => {
    const users = snapshot.val();
    const count = users ? Object.keys(users).length : 0;
    document.getElementById("userCount").textContent = count;
  });

  // Fetch transactions from /transactions and total amount
  const txRef = db.ref("transactions");
  txRef.once("value", snapshot => {
    let totalAmount = 0;
    let totalCount = 0;
    snapshot.forEach(child => {
      const tx = child.val();
      if (tx.amount) {
        totalAmount += parseFloat(tx.amount);
      }
      totalCount++;
    });
    document.getElementById("transactionCount").textContent = totalCount;
    document.getElementById("amountSum").textContent = "₹" + totalAmount.toLocaleString();
  });

  // Render static charts
  renderCharts();
}

function renderCharts() {
  // User growth chart (static data)
  new Chart(document.getElementById('userChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{
        label: 'Users',
        data: [100, 300, 500, 700, 1187],
        backgroundColor: '#00ffe0',
        borderColor: '#00ffe0',
        fill: false
      }]
    },
    options: { responsive: true }
  });

  // Transactions distribution chart (static data)
  new Chart(document.getElementById('pieChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Success', 'Pending', 'Failed'],
      datasets: [{
        label: 'Transactions',
        data: [230, 50, 44],
        backgroundColor: ['#00ff95', '#ffaa00', '#ff005c']
      }]
    },
    options: { responsive: true }
  });
}
