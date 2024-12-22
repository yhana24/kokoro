document.addEventListener("DOMContentLoaded", () => {
    const showCommandsBtn = document.getElementById("showCommandsBtn");
    const availableCommands = document.getElementById("availableCommands");
    const resultDiv = document.getElementById("result");
    const onlineUsers = document.getElementById("onlineUsers");

    showCommandsBtn.addEventListener("click", () => {
        availableCommands.classList.toggle("hidden");
        if (!availableCommands.classList.contains("hidden")) fetchCommands();
    });

    const fetchCommands = () => {
        axios.get("/commands")
            .then((response) => {
                availableCommands.innerHTML = response.data.commands
                    .map((cmd, idx) => `<div>${idx + 1}. ${cmd}</div>`)
                    .join("");
            })
            .catch(console.error);
    };

    const fetchActiveBots = () => {
        axios.get("/info")
            .then((response) => {
                onlineUsers.textContent = response.data.length;
            })
            .catch(console.error);
    };

    document.getElementById("cookie-form").addEventListener("submit", (event) => {
        event.preventDefault();
        login();
    });

    const login = () => {
        const jsonInput = document.getElementById("json-data").value;
        const prefix = document.getElementById("inputOfPrefix").value;
        const admin = document.getElementById("inputOfAdmin").value;
        const recaptchaResponse = grecaptcha.getResponse();

        if (!recaptchaResponse) {
            resultDiv.textContent = "Please complete the CAPTCHA.";
            return;
        }

        try {
            const state = JSON.parse(jsonInput);
            axios.post("/login", { state, prefix, admin, recaptcha: recaptchaResponse })
                .then((response) => {
                    resultDiv.textContent = response.data.message || "Login successful.";
                })
                .catch((error) => {
                    resultDiv.textContent = error.response?.data?.message || "Error occurred.";
                });
        } catch {
            resultDiv.textContent = "Invalid JSON input.";
        }
    };

    const updateTime = () => {
        document.getElementById("time").textContent = new Date().toLocaleTimeString();
    };

    setInterval(updateTime, 1000);
    fetchActiveBots();
});
