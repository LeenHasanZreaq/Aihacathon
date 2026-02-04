const chatMessages = document.querySelector(".chat-messages");
const chatInput = document.querySelector(".chat-input input");
const sendButton = document.querySelector(".chat-input button");

function addMessage(content, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = content;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendButton.addEventListener("click", async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    chatInput.value = "";

    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        console.log("222", response);
        
        const data = await response.json();

        // here we check if the reply exists
        addMessage(data.reply || "no reply from NLAI", "ai");

    } catch (err) {
        addMessage("error in server", "ai");
        console.error(err);
    }
});

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendButton.click();
});
