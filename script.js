import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc, getDoc, query, orderBy, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDkMZKejZAT9WsjzbObiAblUmJbP3P3O0k",
  authDomain: "barangaya-730e6.firebaseapp.com",
  projectId: "barangaya-730e6",
  storageBucket: "barangaya-730e6.firebasestorage.app",
  messagingSenderId: "191169452969",
  appId: "1:191169452969:web:201a194fb88338f78642b8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// NOTIFICATION
function showNotification(msg, type="success"){
    const notif = document.getElementById("notification");
    notif.innerText = msg;
    notif.classList.remove("hidden","error");
    if(type==="error") notif.classList.add("error");
    setTimeout(()=>{notif.classList.add("hidden")},3000);
}

// SIGNUP
window.signup = async function(){
    const email = signupUser.value.trim();
    const password = signupPass.value.trim();
    if(!email || !password){ showNotification("Fill all fields","error"); return; }
    if(password.length < 6){ showNotification("Password must be at least 6 chars","error"); return; }

    try {
        const userCred = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCred.user;
        await setDoc(doc(db,"users",user.uid), { email, role:"resident" });
        showNotification("Account created & logged in!");
        signupUser.value=""; signupPass.value="";
        signupBox.classList.add("hidden");
    } catch(error){ showNotification(error.message,"error"); }
};

// LOGIN
window.login = async function(){
    const email = loginUser.value.trim();
    const password = loginPass.value.trim();
    if(!email || !password){ showNotification("Fill all fields","error"); return; }

    try {
        await signInWithEmailAndPassword(auth,email,password);
        showNotification("Login successful!");
        loginUser.value=""; loginPass.value="";
    } catch(error){ showNotification("Invalid email or password","error"); }
};

// ENTER key
loginPass.addEventListener("keypress", e=>{ if(e.key==="Enter") login(); });
signupPass.addEventListener("keypress", e=>{ if(e.key==="Enter") signup(); });

// AUTO DASHBOARD
onAuthStateChanged(auth, async (user)=>{
    if(user){
        const docSnap = await getDoc(doc(db,"users",user.uid));
        if(docSnap.exists()){
            const role = docSnap.data().role;
            if(role==="admin") showAdminDashboard();
            else showResidentDashboard();
        }
    } else {
        loginSection.classList.remove("hidden");
        residentSection.classList.add("hidden");
        adminSection.classList.add("hidden");
    }
});

// LOGOUT
window.logout = async function(){ await signOut(auth); showNotification("Logged out"); };

// DASHBOARDS
function showResidentDashboard(){
    loginSection.classList.add("hidden");
    adminSection.classList.add("hidden");
    residentSection.classList.remove("hidden");
    loadAnnouncements();
    loadForum();
}

function showAdminDashboard(){
    loginSection.classList.add("hidden");
    residentSection.classList.add("hidden");
    adminSection.classList.remove("hidden");
    displayUsers();
    displayAnnouncementsAdmin();
    displayForumAdmin();
}

// TOGGLE SIGNUP
window.toggleSignup = function(){ signupBox.classList.toggle("hidden"); };

// ANNOUNCEMENTS
async function loadAnnouncements(){
    announcementList.innerHTML="";
    const q = query(collection(db,"announcements"),orderBy("date","desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc=>{
        const a=doc.data();
        announcementList.innerHTML+=`<div class="announcement-item"><strong>${a.title}</strong><br>Date: ${a.date}<br>Schedule: ${a.schedule}</div>`;
    });
}

// FORUM
window.addForum = async function(){
    const text = forumText.value.trim();
    if(!text) return;
    await addDoc(collection(db,"forum"), { user:auth.currentUser.email, text, createdAt:serverTimestamp() });
    forumText.value="";
    loadForum();
}

async function loadForum(){
    forumList.innerHTML="";
    const q = query(collection(db,"forum"), orderBy("createdAt","desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc=>{
        const f=doc.data();
        forumList.innerHTML+=`<div class="forum-item"><strong>${f.user}</strong><br>${f.text}</div>`;
    });
}

// ADMIN USERS
async function displayUsers(){
    const q = collection(db,"users");
    const snapshot = await getDocs(q);
    adminUserList.innerHTML="";
    snapshot.forEach(doc=>{
        const data=doc.data();
        adminUserList.innerHTML+=`<div class="announcement-item">${data.email} - ${data.role}</div>`;
    });
}

// ADMIN ANNOUNCEMENTS
async function addAnnouncementAdmin(){
    const title=adminAnnTitle.value, date=adminAnnDate.value, schedule=adminAnnSchedule.value;
    if(!title||!date||!schedule){ showNotification("Fill all fields","error"); return; }
    await addDoc(collection(db,"announcements"), {title,date,schedule});
    showNotification("Announcement added!");
    adminAnnTitle.value=""; adminAnnDate.value=""; adminAnnSchedule.value="";
    displayAnnouncementsAdmin();
}

async function displayAnnouncementsAdmin(){
    const snapshot = await getDocs(collection(db,"announcements"));
    adminAnnouncementList.innerHTML="";
    snapshot.forEach(doc=>{
        const data=doc.data();
        adminAnnouncementList.innerHTML+=`<div class="announcement-item"><strong>${data.title}</strong> ${data.date} ${data.schedule}</div>`;
    });
}

// CLEARANCE
window.showClearanceForm = function(){
    residentSection.classList.add("hidden");
    clearanceSection.classList.remove("hidden");
    issueDate.innerText = new Date().toLocaleDateString();
}
window.backToDashboard = function(){ clearanceSection.classList.add("hidden"); residentSection.classList.remove("hidden"); }
window.printClearance = function(){ window.print(); }
