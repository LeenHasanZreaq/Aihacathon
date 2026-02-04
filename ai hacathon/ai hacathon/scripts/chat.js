

const chatMessages = document.querySelector(".chat-messages");
var chatInput = document.querySelector(".chat-input input");
const sendButton = document.querySelector(".chat-input button");
let isWaitingForResponse = false;

function addMessage(content, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = content;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}



// Load tasks from local storage
function getTasksFromStorage() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
        console.log("Saved tasks available:", savedTasks);
        return JSON.parse(savedTasks);
    }
    console.log("No saved tasks found");
    return [];
}

sendButton.addEventListener("click", async () => {
    // Prevent duplicate requests
    if (isWaitingForResponse) {
        addMessage("⏳ Already waiting for a response... please be patient", "ai");
        return;
    }

    const userMessage = chatInput.value.trim();
    const tasks = getTasksFromStorage();
    
    // Format message with tasks context
    let message = userMessage;
    if (tasks.length > 0) {
        message += "\n\n[My Tasks Context]: " + JSON.stringify(tasks, null, 2);
    }

    if (!message.trim()) return;

    addMessage(userMessage, "user");
    chatInput.value = "";
    
    // Disable send button
    isWaitingForResponse = true;
    sendButton.disabled = true;
    sendButton.textContent = "Sending...";

    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, tasks })
        });

        const data = await response.json();

        // here we check if the reply exists
        addMessage(data.reply || "no reply from NLAI", "ai");

    } catch (err) {
        addMessage("⚠️ Error: " + err.message, "ai");
        console.error(err);
    } finally {
        // Re-enable send button
        isWaitingForResponse = false;
        sendButton.disabled = false;
        sendButton.textContent = "Send";
    }
});

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendButton.click();
});

