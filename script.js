// ================= USERS =================
function getUsers(){
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users){
    localStorage.setItem("users", JSON.stringify(users));
}

function signup(){
    const u = signupUser.value;
    const p = signupPass.value;

    if(u === "" || p === ""){
        alert("Fill all fields!");
        return;
    }

    const users = getUsers();
    users.push({username:u, password:p});
    saveUsers(users);

    alert("Registered Successfully!");
    signupUser.value="";
    signupPass.value="";
}

function login(){
    const u = loginUser.value;
    const p = loginPass.value;

    if(u==="admin" && p==="admin123"){
        loginSection.classList.add("hidden");
        adminSection.classList.remove("hidden");
        displayTracker();
        displayAdminForum();
        return;
    }

    const users = getUsers();
    const found = users.find(x=>x.username===u && x.password===p);

    if(found){
        localStorage.setItem("currentUser", u);
        loginSection.classList.add("hidden");
        residentSection.classList.remove("hidden");
        displayAnnouncements();
        displayForum();
    } else {
        alert("Invalid Login");
    }
}

function logout(){
    location.reload();
}

function toggleSignup(){
    signupBox.classList.toggle("hidden");
}

// ================= ANNOUNCEMENTS =================
function getAnnouncements(){
    return JSON.parse(localStorage.getItem("announcements")) || [];
}

function addAnnouncement(){
    const list = getAnnouncements();

    list.push({
        title: annTitle.value,
        date: annDate.value,
        schedule: annSched.value
    });

    localStorage.setItem("announcements", JSON.stringify(list));
    alert("Announcement Posted!");
}

function displayAnnouncements(){
    const list = getAnnouncements();
    announcementList.innerHTML="";

    list.forEach(a=>{
        announcementList.innerHTML+=`
            <div class="card">
                <strong>${a.title}</strong>
                <p>Date: ${a.date}</p>
                <p>Schedule: ${a.schedule}</p>
            </div>`;
    });
}

// ================= CLEARANCE =================
function generateClearance(){
    const text = `
BARANGAY CLEARANCE

This certifies that ${clearName.value}
is a resident of this Barangay.

Purpose: ${clearPurpose.value}

Date Issued: ${new Date().toLocaleDateString()}
    `;

    clearOutput.innerText=text;

    const blob=new Blob([text],{type:"text/plain"});
    const link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download="clearance.txt";
    link.click();
}

function printClearance(){
    window.print();
}

// ================= FORUM =================
function getForum(){
    return JSON.parse(localStorage.getItem("forum")) || [];
}

function addForum(){
    const forum=getForum();

    forum.push({
        user:localStorage.getItem("currentUser"),
        text:forumText.value,
        approved:false,
        reply:""
    });

    localStorage.setItem("forum",JSON.stringify(forum));
    alert("Submitted for approval");
}

function displayForum(){
    const forum=getForum();
    forumList.innerHTML="";

    forum.filter(f=>f.approved).forEach(f=>{
        forumList.innerHTML+=`
            <div class="card">
                <strong>${f.user}</strong>
                <p>${f.text}</p>
                <small style="color:green;">${f.reply}</small>
            </div>`;
    });
}

// ================= ADMIN FORUM =================
function displayAdminForum(){
    const forum=getForum();
    adminForum.innerHTML="";

    forum.forEach((f,index)=>{
        adminForum.innerHTML+=`
            <div class="card">
                <strong>${f.user}</strong>
                <p>${f.text}</p>
                <button onclick="approve(${index})">Approve</button>
                <button class="btn-danger" onclick="removePost(${index})">Delete</button>
                <input type="text" id="reply${index}" placeholder="Reply">
                <button onclick="replyPost(${index})">Reply</button>
            </div>`;
    });
}

function approve(index){
    const forum=getForum();
    forum[index].approved=true;
    localStorage.setItem("forum",JSON.stringify(forum));
    displayAdminForum();
}

function removePost(index){
    const forum=getForum();
    forum.splice(index,1);
    localStorage.setItem("forum",JSON.stringify(forum));
    displayAdminForum();
}

function replyPost(index){
    const forum=getForum();
    const replyText=document.getElementById("reply"+index).value;
    forum[index].reply=replyText;
    localStorage.setItem("forum",JSON.stringify(forum));
    displayAdminForum();
}

// ================= TRACKER =================
function displayTracker(){
    const users=getUsers();
    tracker.innerHTML="";
    users.forEach(u=>{
        tracker.innerHTML+=`<p>${u.username}</p>`;
    });
}
