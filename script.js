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

    if (email === "" || password === "") {
        showNotification("Please fill all fields", "error");
        return;
    }

    if (password.length < 6) {
        showNotification("Password must be at least 6 characters", "error");
        return;
    }

    try {
        // Create account
        await createUserWithEmailAndPassword(auth, email, password);

        showNotification("Account Created & Logged In!");

        // Clear fields
        signupUser.value = "";
        signupPass.value = "";

        // Hide signup box
        signupBox.classList.add("hidden");

        // Dashboard will automatically show because of onAuthStateChanged

    } catch (error) {
        showNotification(error.message, "error");
    }
};

// Press Enter to Login
loginPass.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        login();
    }
});

// Press Enter to Signup
signupPass.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        signup();
    }
});


// =============================
// 🔐 ENHANCED LOGIN
// =============================
window.login = async function () {

    const email = loginUser.value.trim();
    const password = loginPass.value.trim();

    if (email === "" || password === "") {
        showNotification("Please enter email and password", "error");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);

        showNotification("Login Successful!");

        loginUser.value = "";
        loginPass.value = "";

    } catch (error) {
        showNotification("Invalid email or password", "error");
    }
};


// Auto detect login
onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        const userRef = doc(db, "users", uid);
        getDoc(userRef).then(docSnap => {
            if (docSnap.exists()) {
                const role = docSnap.data().role;
                if (role === "admin") {
                    showAdminDashboard();
                } else {
                    showResidentDashboard();
                }
            }
        });
    } else {
        loginSection.classList.remove("hidden");
        residentSection.classList.add("hidden");
        adminSection.classList.add("hidden");
    }
});


// =============================
// 🚪 LOGOUT
// =============================
window.logout = async function () {
    await signOut(auth);
    showNotification("You have logged out.");
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
    document.getElementById("issueDate").innerText =
    new Date().toLocaleDateString();
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

// SHOW ADMIN DASHBOARD
function showAdminDashboard() {
    loginSection.classList.add("hidden");
    residentSection.classList.add("hidden");
    adminSection.classList.remove("hidden");
    displayUsers();
    displayAnnouncementsAdmin();
    displayForumAdmin();
}

// USERS
async function displayUsers() {
    const querySnapshot = await getDocs(collection(db, "users"));
    const list = document.getElementById("adminUserList");
    list.innerHTML = "";
    querySnapshot.forEach(doc => {
        const data = doc.data();
        list.innerHTML += `
            <div class="announcement-item">
                ${data.email} - ${data.role}
                <button onclick="deleteUser('${doc.id}')">Delete</button>
            </div>
        `;
    });
}

async function deleteUser(uid) {
    await deleteDoc(doc(db, "users", uid));
    showNotification("User deleted");
    displayUsers();
}

// ANNOUNCEMENTS
async function addAnnouncementAdmin() {
    const title = adminAnnTitle.value;
    const date = adminAnnDate.value;
    const schedule = adminAnnSchedule.value;

    if (!title || !date || !schedule) return showNotification("Fill all fields", "error");

    await addDoc(collection(db, "announcements"), { title, date, schedule });
    showNotification("Announcement added!");
    adminAnnTitle.value = "";
    adminAnnDate.value = "";
    adminAnnSchedule.value = "";
    displayAnnouncementsAdmin();
}

async function displayAnnouncementsAdmin() {
    const querySnapshot = await getDocs(collection(db, "announcements"));
    const list = document.getElementById("adminAnnouncementList");
    list.innerHTML = "";
    querySnapshot.forEach(doc => {
        const data = doc.data();
        list.innerHTML += `
            <div class="announcement-item">
                <strong>${data.title}</strong> ${data.date} ${data.schedule}
                <button onclick="deleteAnnouncement('${doc.id}')">Delete</button>
            </div>
        `;
    });
}

async function deleteAnnouncement(id) {
    await deleteDoc(doc(db, "announcements", id));
    showNotification("Announcement deleted");
    displayAnnouncementsAdmin();
}

// FORUM
async function displayForumAdmin() {
    const querySnapshot = await getDocs(collection(db, "forum"));
    const list = document.getElementById("adminForumList");
    list.innerHTML = "";
    querySnapshot.forEach(doc => {
        const data = doc.data();
        list.innerHTML += `
            <div class="forum-item">
                <strong>${data.user}</strong>: ${data.text}
                <button onclick="deleteForumPost('${doc.id}')">Delete</button>
            </div>
        `;
    });
}

async function deleteForumPost(id) {
    await deleteDoc(doc(db, "forum", id));
    showNotification("Forum post deleted");
    displayForumAdmin();
}




