
const chatmessages = [];

function sidebar() {
    document.querySelector(".sidebar").classList.add("show");
}
function remove() {
    document.querySelector(".sidebar").classList.remove("show");
}
document.getElementById("inputMessage").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const message = document.getElementById("inputMessage").textContent.trim();
    if (message !== "") {
        const newdiv = document.createElement("div");
        newdiv.className = "newDiv";
        newdiv.textContent = message;
        document.getElementById("contain").append(newdiv);
        chatmessages.push({ role: "user", text: message });
        document.getElementById("inputMessage").textContent = "";
        getanswer(message);
        document.getElementById("contain").scrollTop = document.getElementById("contain").scrollHeight;
    }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    document.getElementById("mic").addEventListener("click", () => {
        document.getElementById("inputMessage").setAttribute("data-placeholder", "Listening...");
        recognition.start();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("inputMessage").textContent = transcript;
        document.getElementById("inputMessage").setAttribute("data-placeholder", "Type your message...");
        document.getElementById("inputMessage").focus();
    };

    recognition.onerror = (event) => {
        document.getElementById("inputMessage").setAttribute("data-placeholder", "Voice Error: " + event.error);
    };
} else {
    alert("Voice recognition not supported by the browser");
}

function delete1() {
    document.getElementById("contain").innerHTML = "";
}

async function getanswer(question) {
    const response = await fetch("https://chatbot-2lcw.onrender.com/getanswer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
    });
    const data = await response.json();

    const answer = document.createElement("div");
    answer.className = "answerDiv";
    document.getElementById("contain").append(answer);
    document.getElementById("contain").scrollTop = document.getElementById("contain").scrollHeight;

    if (response.ok) {
        answer.textContent = data.answer;
        chatmessages.push({ role: "bot", text: data.answer });
    } else {
        answer.textContent = data.message || "Error getting response";
    }
}

async function clearchat() {
    if (chatmessages.length === 0) return;

    try {
        await fetch("https://chatbot-2lcw.onrender.com/savechat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: chatmessages.map(m => ({
                    sender: m.role,
                    text: m.text
                }))
            })
        });
        document.getElementById("contain").innerHTML = '';
        chatmessages.length = 0;
    } catch (err) {
        console.error("Failed to save chat:", err);
    }
}

document.getElementById("feedback-btn").addEventListener("mouseenter", () => {
    document.getElementById("back").style.opacity = 1;
    document.getElementById("back").focus();
});
document.getElementById("feedback-btn").addEventListener("mouseleave", () => {
    document.getElementById("back").style.opacity = 0;
});

document.getElementById("back").addEventListener("keydown", async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const mess = document.getElementById("back").value.trim();
        if (mess !== '') {
            try {
                const res1 = await fetch("https://chatbot-2lcw.onrender.com/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ feedback: mess })
                });
                document.getElementById("back").value = '';
            } catch (err) {
                console.error("Failed to upload feedback:", err);
            }
        }
    }
});
