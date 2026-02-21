// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 CONFIG
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

// DOM
const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");
const signupUser = document.getElementById("signupUser");
const signupPass = document.getElementById("signupPass");
const loginSection = document.getElementById("loginSection");
const residentSection = document.getElementById("residentSection");
const adminSection = document.getElementById("adminSection");
const signupBox = document.getElementById("signupBox");

// 🔐 SIGNUP
window.signup = async function () {
    const email = signupUser.value.trim();
    const password = signupPass.value.trim();
    if(!email || !password){ return showNotification("Fill all fields", "error");}
    if(password.length < 6){ return showNotification("Password min 6 chars","error");}
    try {
        const userCredential = await createUserWithEmailAndPassword(auth,email,password);
        const uid = userCredential.user.uid;
        await setDoc(doc(db,"users",uid),{email: email, role:"resident"});
        showNotification("Account Created & Logged In!");
        signupUser.value=""; signupPass.value="";
        signupBox.classList.add("hidden");
    } catch(e){ showNotification(e.message,"error");}
};

// 🔐 LOGIN
window.login = async function() {
    const email = loginUser.value.trim();
    const password = loginPass.value.trim();
    if(!email||!password){ return showNotification("Fill all fields","error");}
    try {
        await signInWithEmailAndPassword(auth,email,password);
        loginUser.value=""; loginPass.value="";
    } catch(e){ showNotification("Invalid email or password","error");}
};

// ENTER key login/signup
loginPass.addEventListener("keypress", e=>{if(e.key==="Enter") login();});
signupPass.addEventListener("keypress", e=>{if(e.key==="Enter") signup();});

// 🔐 LOGOUT
window.logout = async function(){await signOut(auth); showNotification("Logged out.");};

// AUTO LOGIN
onAuthStateChanged(auth, async (user)=>{
    if(user){
        const docSnap = await getDoc(doc(db,"users",user.uid));
        if(docSnap.exists()){
            const role = docSnap.data().role;
            if(role==="admin"){ showAdminDashboard(); }
            else{ showResidentDashboard(); }
        }
    } else {
        loginSection.classList.remove("hidden");
        residentSection.classList.add("hidden");
        adminSection.classList.add("hidden");
    }
});

// NOTIFICATION
function showNotification(msg,type="success"){
    const n = document.getElementById("notification");
    n.innerText=msg; n.classList.remove("hidden","error");
    if(type==="error") n.classList.add("error");
    setTimeout(()=>{n.classList.add("hidden");},3000);
}

// DASHBOARD SHOW
function showResidentDashboard(){loginSection.classList.add("hidden");adminSection.classList.add("hidden");residentSection.classList.remove("hidden"); loadAnnouncements(); loadForum();}
function showAdminDashboard(){loginSection.classList.add("hidden");residentSection.classList.add("hidden");adminSection.classList.remove("hidden"); displayUsers(); displayAnnouncementsAdmin(); displayForumAdmin();}

// 🔢 ANNOUNCEMENTS
async function loadAnnouncements(){
    const list = document.getElementById("announcementList");
    list.innerHTML="";
    const q = query(collection(db,"announcements"),orderBy("date","desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc=>{
        const a = doc.data();
        list.innerHTML+=`<div class="announcement-item"><strong>${a.title}</strong><br>Date:${a.date}<br>Schedule:${a.schedule}</div>`;
    });
}

// 🔢 FORUM
window.addForum = async function(){
    const text = document.getElementById("forumText").value.trim();
    if(!text) return;
    await addDoc(collection(db,"forum"),{user:auth.currentUser.email,text,createdAt:serverTimestamp()});
    document.getElementById("forumText").value="";
    loadForum();
};
async function loadForum(){
    const list = document.getElementById("forumList");
    list.innerHTML="";
    const q = query(collection(db,"forum"),orderBy("createdAt","desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc=>{
        const f = doc.data();
        list.innerHTML+=`<div class="forum-item"><strong>${f.user}</strong><br>${f.text}</div>`;
    });
}

// 🧾 CLEARANCE
window.showClearanceForm = function(){
    residentSection.classList.add("hidden");
    document.getElementById("clearanceSection").classList.remove("hidden");
    document.getElementById("issueDate").innerText=new Date().toLocaleDateString();
};
window.backToDashboard=function(){document.getElementById("clearanceSection").classList.add("hidden");residentSection.classList.remove("hidden");};
window.printClearance=function(){window.print();};

// 🔹 ADMIN FUNCTIONS
async function displayUsers(){
    const q = await getDocs(collection(db,"users"));
    const list = document.getElementById("adminUserList");
    list.innerHTML="";
    q.forEach(doc=>{const data=doc.data(); list.innerHTML+=`<div class="announcement-item">${data.email}-${data.role}</div>`;});
}
async function addAnnouncementAdmin(){
    const title=document.getElementById("adminAnnTitle").value;
    const date=document.getElementById("adminAnnDate").value;
    const schedule=document.getElementById("adminAnnSchedule").value;
    if(!title||!date||!schedule) return showNotification("Fill all fields","error");
    await addDoc(collection(db,"announcements"),{title,date,schedule});
    showNotification("Announcement added!");
    document.getElementById("adminAnnTitle").value="";
    document.getElementById("adminAnnDate").value="";
    document.getElementById("adminAnnSchedule").value="";
    displayAnnouncementsAdmin();
}
async function displayAnnouncementsAdmin(){
    const q = await getDocs(collection(db,"announcements"));
    const list = document.getElementById("adminAnnouncementList");
    list.innerHTML
