function sidebar() {
    document.querySelector(".sidebar").classList.add("show")
}
function remove() {
    document.querySelector(".sidebar").classList.remove("show")
}
document.getElementById("inputMessage").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
})

function sendMessage() {
    const message = document.getElementById("inputMessage").textContent.trim();
    if (message != "") {
        const newdiv = document.createElement("div");
        newdiv.className = "newDiv";
        newdiv.textContent = message;
        document.getElementById("contain").append(newdiv);
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
}
else {
    alert("Voice recognition not supported by the browser");
}
function toggleTheme() {
    const img = document.getElementById("change");
    const nav = document.querySelector("nav");
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const input = document.getElementById("inputMessage");
    const backInput = document.querySelector(".back");
    const sidebar = document.querySelector(".sidebar");

    const isSun = img.src.includes("moon-removebg-preview.png");

    if (isSun) {

        img.src = "sun-removebg-preview.png";
        nav.style.backgroundColor = "#0D0D0D";
        main.style.backgroundColor = "#1A1A1A";
        footer.style.backgroundColor = "#0D0D0D";
        input.style.backgroundColor = "#3a3a3a";
        input.style.color = "#f5f5f5";
        sidebar.style.backgroundColor = "rgba(30, 30, 30, 0.9)";
        backInput.style.backgroundColor = "#2a2a2a";
        backInput.style.color = "#f5f5f5";



        document.querySelectorAll(".feedback, .chat, .history").forEach(el => {
            el.style.color = "#FFFBDB";
        });
    } else {

        img.src = "moon-removebg-preview.png";
        nav.style.backgroundColor = "#A86D79";
        main.style.backgroundColor = "#F6EAEA";
        footer.style.backgroundColor = "#A86D79";
        input.style.backgroundColor = "rgba(125, 100, 110, 1)";
        input.style.color = "#29291F";
        sidebar.style.backgroundColor = "rgba(255, 235, 238, 0.8)";
        backInput.style.backgroundColor = "#ffffff";
        backInput.style.color = "#0D0D0D";

        document.querySelectorAll(".feedback, .chat, .history").forEach(el => {
            el.style.color = "#0D0D0D";
        });
    }
}

document.getElementById("feedback-btn").addEventListener("mouseenter", () => {
    document.getElementById("back").style.opacity = 1;
    document.getElementById("back").focus();
    document.getElementById("back").style.cursor = ""
})
document.getElementById("feedback-btn").addEventListener("mouseleave", () => {
    document.getElementById("back").style.opacity = 0;

})

function delete1() {
    document.getElementById("contain").innerHTML = "";
}

async function getanswer(question) {


const response = await fetch("https://chatbot-2lcw.onrender.com/getanswer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: question })
    });
    const data = await response.json();

    const answer = document.createElement("div");
    answer.className = "answerDiv";
    document.getElementById("contain").append(answer);
    document.getElementById("contain").scrollTop = document.getElementById("contain").scrollHeight;
    if (response.ok) {
        answer.textContent = data.answer;
    } else {
        answer.textContent = data.message || "Error getting response";
    }
}