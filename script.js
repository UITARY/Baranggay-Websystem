// 🔥 FIREBASE IMPORTS
import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 
"https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from 
"https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDkMZKejZAT9WsjzbObiAblUmJbP3P3O0k",
  authDomain: "barangaya-730e6.firebaseapp.com",
  projectId: "barangaya-730e6",
  storageBucket: "barangaya-730e6.firebasestorage.app",
  messagingSenderId: "191169452969",
  appId: "1:191169452969:web:201a194fb88338f78642b8"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



// =============================
// 🔐 ENHANCED SIGNUP
// =============================
window.signup = async function () {

    const email = signupUser.value.trim();
    const password = signupPass.value.trim();

    if (email.length < 5) {
        alert("Email must be valid.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account Created Successfully!");
        signupUser.value = "";
        signupPass.value = "";
    } catch (error) {
        alert(error.message);
    }
};



// =============================
// 🔐 ENHANCED LOGIN
// =============================
window.login = async function () {

    const email = loginUser.value.trim();
    const password = loginPass.value.trim();

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login Successful!");
    } catch (error) {
        alert("Login Failed: " + error.message);
    }
};


// Auto detect login
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add("hidden");
        residentSection.classList.remove("hidden");
        loadAnnouncements();
        loadForum();
    } else {
        loginSection.classList.remove("hidden");
        residentSection.classList.add("hidden");
    }
});



// =============================
// 🚪 LOGOUT
// =============================
window.logout = async function () {
    await signOut(auth);
    alert("Logged out.");
};



// =============================
// 📢 ANNOUNCEMENTS (FIRESTORE)
// =============================
async function loadAnnouncements() {

    announcementList.innerHTML = "";

    const q = query(collection(db, "announcements"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
        const a = doc.data();
        announcementList.innerHTML += `
            <div class="announcement-item">
                <strong>${a.title}</strong><br>
                Date: ${a.date}<br>
                Schedule: ${a.schedule}
            </div>`;
    });
}



// =============================
// 💬 FORUM (FIRESTORE)
// =============================
window.addForum = async function () {

    const text = forumText.value.trim();
    if (text === "") return;

    const user = auth.currentUser;

    await addDoc(collection(db, "forum"), {
        user: user.email,
        text: text,
        createdAt: serverTimestamp()
    });

    forumText.value = "";
    loadForum();
};


async function loadForum() {

    forumList.innerHTML = "";

    const q = query(collection(db, "forum"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
        const f = doc.data();
        forumList.innerHTML += `
            <div class="forum-item">
                <strong>${f.user}</strong><br>
                ${f.text}
            </div>`;
    });
}



// =============================
// 📄 CLEARANCE (Same as yours)
// =============================
window.generateClearance = function () {

    const text = `
BARANGAY CLEARANCE

This certifies that ${clearName.value}
is a resident of this Barangay.

Purpose: ${clearPurpose.value}

Date Issued: ${new Date().toLocaleDateString()}
    `;

    clearOutput.innerText = text;

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "clearance.txt";
    link.click();
};


window.printClearance = function () {
    window.print();
};


window.showClearanceForm = function () {
    residentSection.classList.add("hidden");
    clearanceSection.classList.remove("hidden");
};


window.backToDashboard = function () {
    clearanceSection.classList.add("hidden");
    residentSection.classList.remove("hidden");
};


window.toggleSignup = function () {
    signupBox.classList.toggle("hidden");
};

function showNotification(message, type = "success") {
    const notif = document.getElementById("notification");
    
    notif.innerText = message;
    notif.classList.remove("hidden");
    notif.classList.remove("error");

    if (type === "error") {
        notif.classList.add("error");
    }

    setTimeout(() => {
        notif.classList.add("hidden");
    }, 3000);
}
