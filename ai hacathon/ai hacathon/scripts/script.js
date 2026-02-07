function addTask() {
    // Get values from input fields
    const task = document.getElementById("taskInput").value;
    const difficulty = document.getElementById("difficultyInput").value;
    const rating = document.getElementById("ratingInput").value;

    // Validate that the task input is not empty
    if (task.trim() === "") {
        alert("Please enter a task");
        return;
    }

    // Add the new task to the table
    const table = document.getElementById("taskTableBody");
    const row = table.insertRow();

    // Insert cells and set their text
    row.insertCell(0).innerText = task;
    row.insertCell(1).innerText = difficulty;
    row.insertCell(2).innerText = rating;

    // Clear input fields after adding the task
    document.getElementById("taskInput").value = "";
    document.getElementById("difficultyInput").value = "";
    document.getElementById("ratingInput").value = "";
    console.log(savealltasks());
}

// Save all tasks to localStorage
function savealltasks() {
    // Get all tasks from the table and save them in an array
    const table = document.getElementById("taskTableBody");
    const tasks = [];
    // Start from 1 to skip the header row
    for (let i = 1, row; row = table.rows[i]; i++){
        const task = row.cells[0].innerText;
        const difficulty = row.cells[1].innerText;
        const rating = row.cells[2].innerText;
        // Push the task object to the tasks array
        tasks.push({ task, difficulty, rating });
    }
    // Save the tasks array to localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
    return tasks;
}



// Load tasks from localStorage when the page loads
function searchTask() {
    // Get the search input value and convert it to lowercase for case-insensitive search
    const searchValue = document
    
        .getElementById("searchInput")
        .value.toLowerCase();

        // Get all rows from the task table and loop through them to check if they match the search query
    const rows = document.querySelectorAll("#taskTableBody tr");

    // Start from 1 to skip the header row
    rows.forEach((row, index) => {
        if (index === 0) return;

        // Get the task text from the first cell of the row and check if it includes the search value
        const taskText = row.cells[0].innerText.toLowerCase();
        // Show the row if it matches the search query, otherwise hide it .
        row.style.display = taskText.includes(searchValue) ? "" : "none";
    });
}

// Navigate to the chat page when the "Go to Chat" button is clicked
function goToChat() {
    // Redirect to the chat.html page
    window.location.href = "chat.html";
}

//          chat.html       (AI chat page) 