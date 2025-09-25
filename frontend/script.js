const chatIcon = document.getElementById("chat-icon");
const chatBox = document.getElementById("chat-box");
const messages = document.getElementById("messages");
const userInput = document.getElementById("user-input");
const botSound = document.getElementById("bot-sound");
const assistBubble = document.getElementById("assist-bubble");
const sendButton = document.getElementById("send-button");

// Markdown-to-HTML formatter
function formatBotReply(text) {
  let html = text;
  html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/^\* (.*?)$/gm, "<li>$1</li>");
  if (html.includes("<li>")) html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  html = html.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>");
  return `<p>${html}</p>`;
}

// Open/close chat box
chatIcon.addEventListener("click", (e) => {
  const wasHidden = chatBox.classList.contains("hidden");
  chatBox.classList.toggle("hidden");

  if (!chatBox.classList.contains("hidden")) {
    botSound.play();
    userInput.focus();
    assistBubble.classList.add("hidden");

    if (wasHidden && messages.childElementCount === 0) {
      addMessage("Hello! I am the AIR bot. Ask me anything regarding the Music Artist Gradation and Music Auditions.", "AIR Bot");
    }
  }

  e.stopPropagation();
});

// Close chat when clicking outside
document.addEventListener("click", (e) => {
  const inside = chatBox.contains(e.target) || chatIcon.contains(e.target);
  if (!inside) {
    chatBox.classList.add("hidden");
    assistBubble.classList.remove("hidden");
  }
});

// Add message to chat window
function getTimestamp() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function addMessage(content, sender, isTyping = false, isHtml = false) {
  const msg = document.createElement("div");
  msg.classList.add("message");

  if (sender === "AIR Bot") {
    msg.classList.add("bot-message");

    if (isTyping) {
      msg.innerHTML = `
        <img src="airbot.png" alt="AIR Bot" class="bot-avatar" />
        <span id="typing-indicator">AIR Bot is typing<span class="dots"></span></span>
      `;
    } else {
      msg.innerHTML = `
        <img src="airbot.png" alt="AIR Bot" class="bot-avatar" />
        <span>${isHtml ? content : formatBotReply(content)}<div class="timestamp">${getTimestamp()}</div></span>
      `;
      botSound.play();
    }

  } else {
    msg.classList.add("user-message");
    msg.innerHTML = `<span class="user-message-text">${content}<div class="timestamp">${getTimestamp()}</div></span>`;
  }

  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  return msg;
}

// Send user message to backend
async function sendMessage() {
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  addMessage(userMsg, "You");
  userInput.value = "";

  const typingEl = addMessage("", "AIR Bot", true);

  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg })
    });

    const data = await res.json();
    messages.removeChild(typingEl);

    if (data.reply_type === "pdf" || data.reply_type === "gemini") {
  addMessage(data.reply, "AIR Bot");
} else if (data.reply_type === "error") {
  addMessage("⚠️ " + (data.message || "Sorry, something went wrong."), "AIR Bot");
} else {
  addMessage("⚠️ Unexpected response from server.", "AIR Bot");
}


  } catch (err) {
    messages.removeChild(typingEl);
    addMessage("There was an error talking to the bot.", "AIR Bot");
  }
}

// Send on Enter key
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Send on Send button click
sendButton.addEventListener("click", () => {
  sendMessage();
});
