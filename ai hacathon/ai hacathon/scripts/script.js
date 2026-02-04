
function addTask() {
    const task = document.getElementById("taskInput").value;
    const difficulty = document.getElementById("difficultyInput").value;
    const rating = document.getElementById("ratingInput").value;

    if (task.trim() === "") {
        alert("Please enter a task");
        return;
    }

    const table = document.getElementById("taskTableBody");
    const row = table.insertRow();

    row.insertCell(0).innerText = task;
    row.insertCell(1).innerText = difficulty;
    row.insertCell(2).innerText = rating;

    document.getElementById("taskInput").value = "";
    document.getElementById("difficultyInput").value = "";
    document.getElementById("ratingInput").value = "";
    console.log(savealltasks());
}

function savealltasks() {
    const table = document.getElementById("taskTableBody");
    const tasks = [];
    for (let i = 1, row; row = table.rows[i]; i++) {
        const task = row.cells[0].innerText;
        const difficulty = row.cells[1].innerText;
        const rating = row.cells[2].innerText;
        tasks.push({ task, difficulty, rating });
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
    return tasks;
}

function searchTask() {
    const searchValue = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const rows = document.querySelectorAll("#taskTableBody tr");

    rows.forEach((row, index) => {
        if (index === 0) return;

        const taskText = row.cells[0].innerText.toLowerCase();
        row.style.display = taskText.includes(searchValue) ? "" : "none";
    });
}

function goToChat() {
    // Change this file name to your chat page
    window.location.href = "chat.html";
}

//          chat.html       (AI chat page) 