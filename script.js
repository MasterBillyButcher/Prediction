import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 櫨 Firebase config (yours)
const firebaseConfig = {
  apiKey: "AIzaSyAWOpBcimB41yfUbV1osY9fJ6JaB2BLDHg",
  authDomain: "bb-prediction-6e081.firebaseapp.com",
  projectId: "bb-prediction-6e081",
  storageBucket: "bb-prediction-6e081.firebasestorage.app",
  messagingSenderId: "789490615243",
  appId: "1:789490615243:web:20b32c2c257ccb379f6c4e",
  measurementId: "G-DS5CTXRKJF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let twitchUser = null;

// 式 Twitch OAuth login
window.onload = () => {
  const params = new URLSearchParams(window.location.hash.substr(1));
  const accessToken = params.get("access_token");

  if (accessToken) {
    fetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Client-ID": "YOUR_TWITCH_CLIENT_ID" // Replace with your actual Client ID
      }
    })
      .then(res => res.json())
      .then(data => {
        twitchUser = data.data[0];
        document.getElementById("login-status").innerText = `Logged in as ${twitchUser.display_name}`;
      })
      .catch(err => {
        console.error("Twitch login failed:", err);
        document.getElementById("login-status").innerText = "Login error";
      });
  }
};

// 竜 Voting logic (updated)
window.vote = async (name) => {
  if (!twitchUser) {
    alert("Please log in with Twitch to vote.");
    return;
  }

  const userTwitchId = twitchUser.id; // Get the unique Twitch user ID
  const hasVotedRef = doc(db, "voters", userTwitchId);
  const hasVotedSnap = await getDoc(hasVotedRef);

  if (hasVotedSnap.exists()) {
    alert("You have already voted!");
    return;
  }

  // If the user hasn't voted yet, proceed to vote
  const contestantRef = doc(db, "contestants", name);
  try {
    // 投 Update the contestant's vote count
    await updateDoc(contestantRef, { votes: increment(1) });
    const snap = await getDoc(contestantRef);
    document.getElementById(`count-${name}`).innerText = `Votes: ${snap.data().votes}`;

    // 投 Record the user's vote in the voters collection
    await setDoc(doc(db, "voters", userTwitchId), {
      votedFor: name,
      timestamp: new Date()
    });
    alert("Vote successful!");

  } catch (error) {
    console.error("Vote failed:", error);
    alert("Error submitting vote.");
  }
};

// 投 Load initial vote counts
const names = [
  "Awez Darbar",
  "Taniya Mittal",
  "Amaal Mallik",
  "Kunickaa Sadanand",
  "Mridul Tiwari"
];

names.forEach(async (name) => {
  const ref = doc(db, "contestants", name);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      document.getElementById(`count-${name}`).innerText = `Votes: ${snap.data().votes}`;
    } else {
      document.getElementById(`count-${name}`).innerText = `Votes: 0`;
    }
  } catch (error) {
    console.error(`Failed to load votes for ${name}:`, error);
  }
});