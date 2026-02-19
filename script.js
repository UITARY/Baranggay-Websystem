// USERS
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

// ANNOUNCEMENTS
if(!localStorage.getItem("announcements")){
    localStorage.setItem("announcements", JSON.stringify([
        {title:"Clean-Up Drive", date:"2026-02-25", schedule:"8:00 AM"},
        {title:"Community Meeting", date:"2026-03-01", schedule:"6:00 PM"}
    ]));
}

function getAnnouncements(){
    return JSON.parse(localStorage.getItem("announcements"));
}

function displayAnnouncements(){
    const list = getAnnouncements();
    announcementList.innerHTML="";

    list.forEach(a=>{
        announcementList.innerHTML+=`
            <div class="announcement-item">
                <strong>${a.title}</strong><br>
                Date: ${a.date}<br>
                Schedule: ${a.schedule}
            </div>`;
    });
}

// CLEARANCE
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

// FORUM
function getForum(){
    return JSON.parse(localStorage.getItem("forum")) || [];
}

function addForum(){
    const forum=getForum();

    forum.push({
        user:localStorage.getItem("currentUser"),
        text:forumText.value
    });

    localStorage.setItem("forum",JSON.stringify(forum));
    forumText.value="";
    displayForum();
}

function displayForum(){
    const forum=getForum();
    forumList.innerHTML="";

    forum.forEach(f=>{
        forumList.innerHTML+=`
            <div class="forum-item">
                <strong>${f.user}</strong><br>
                ${f.text}
            </div>`;
    });
}
