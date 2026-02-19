document.addEventListener("DOMContentLoaded", displayResidents);

function getResidents() {
    return JSON.parse(localStorage.getItem("residents")) || [];
}

function saveResidents(residents) {
    localStorage.setItem("residents", JSON.stringify(residents));
}

function addResident() {
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const address = document.getElementById("address").value;

    if (name === "" || age === "" || address === "") {
        alert("Please fill all fields!");
        return;
    }

    const residents = getResidents();
    residents.push({ name, age, address });
    saveResidents(residents);

    document.getElementById("name").value = "";
    document.getElementById("age").value = "";
    document.getElementById("address").value = "";

    displayResidents();
}

function displayResidents() {
    const residents = getResidents();
    const table = document.getElementById("residentTable");
    table.innerHTML = "";

    residents.forEach((resident, index) => {
        table.innerHTML += `
            <tr>
                <td>${resident.name}</td>
                <td>${resident.age}</td>
                <td>${resident.address}</td>
                <td>
                    <button class="delete-btn" onclick="deleteResident(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function deleteResident(index) {
    const residents = getResidents();
    residents.splice(index, 1);
    saveResidents(residents);
    displayResidents();
}

function searchResident() {
    const input = document.getElementById("search").value.toLowerCase();
    const residents = getResidents();
    const filtered = residents.filter(r => r.name.toLowerCase().includes(input));

    const table = document.getElementById("residentTable");
    table.innerHTML = "";

    filtered.forEach((resident, index) => {
        table.innerHTML += `
            <tr>
                <td>${resident.name}</td>
                <td>${resident.age}</td>
                <td>${resident.address}</td>
                <td>
                    <button class="delete-btn" onclick="deleteResident(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}