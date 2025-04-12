import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn553qWsVz2VF1dZ4Ji5OkQDGFvMORbJE",
  authDomain: "pg-data-ed1c2.firebaseapp.com",
  projectId: "pg-data-ed1c2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const errorText = document.getElementById("loginError");

  if (!email || !password) {
    errorText.textContent = "Please enter both email and password.";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(error => {
      let msg = "Login failed!";
      if (error.code === "auth/user-not-found") msg = "User not found.";
      else if (error.code === "auth/wrong-password") msg = "Incorrect password.";
      else if (error.code === "auth/invalid-email") msg = "Invalid email format.";
      errorText.textContent = msg;
    });
});
