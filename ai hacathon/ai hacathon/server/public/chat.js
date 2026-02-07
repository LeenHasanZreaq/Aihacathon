
const chatMessages = document.querySelector(".chat-messages");
// we select the input and button elements from the chat input section of the HTML document.
const chatInput = document.querySelector(".chat-input input");
const sendButton = document.querySelector(".chat-input button");

/*
this function creates a new div element for each message, 
assigns it the appropriate classes based on the sender (user or AI), 
and appends it to the chat messages container. 
It also ensures that the chat scrolls to the bottom when a new message is added.
*/

function addMessage(content, sender){
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = content;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


/*
we add an event listener to the send button that triggers when it's clicked.
When the button is clicked, it retrieves the message from the input field, 
adds it to the chat as a user message,
and then sends it to the server using a POST request.
The server's response is expected to contain a reply, which is then added to the chat as an AI message.
*/
sendButton.addEventListener("click", async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    chatInput.value = "";


/*
fetch is used to send a POST request to the server at "http://localhost:3000/chat" 
with the user's message in the request body.
*/
    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        // we log the response to the console for debugging purposes.
        console.log("222", response);
        
        // we parse the JSON response from the server,
        //  which is expected to contain a "reply" field with the AI's response.
        const data = await response.json();

        // here we check if the reply exists
        addMessage(data.reply || "no reply from NLAI", "ai");

    } 
    
    // if there's an error during the fetch operation, we catch it and add an error message to the chat, 
    //   and also log the error to the console for debugging.
    catch (err) {
        addMessage("error in server", "ai");
        console.error(err);
    }
});

// we add an event listener to the chat input field that listens for the "keypress" event.
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendButton.click();
});
