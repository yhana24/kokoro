const {
    spawn
} = require("child_process");
const path = require("path");

const SCRIPT_FILE = "kokoro.js";
const SCRIPT_PATH = path.join(__dirname, SCRIPT_FILE);

const MAX_MEMORY_USAGE = 1000 * 1024 * 1024;
const RESTART_DELAY = 5000;

function start() {
    const main = spawn("node", [SCRIPT_PATH], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    main.on("error", (err) => {
        console.error("Error occurred:", err);
        setTimeout(start, RESTART_DELAY);
    });

    main.on("close", (exitCode) => {
        if (exitCode === 0) {
            console.log(`STATUS: [${exitCode}] - Process Exited > SYSTEM Rebooting!...`);
        } else if (exitCode === 1) {
            console.log(`ERROR: [${exitCode}] - System Rebooting!...`);
        } else if (exitCode === 137) {
            console.log(`POTENTIAL DDOS: [${exitCode}] - Out Of Memory Restarting...`);
        } else {
            console.error(`[${exitCode}] - Process Exited!`);
        }
        setTimeout(start, RESTART_DELAY);
    });

    const memoryCheckInterval = setInterval(() => {
        const memoryUsage = process.memoryUsage().heapUsed;

        if (memoryUsage > MAX_MEMORY_USAGE) {
            console.error(
                `Memory usage exceeded ${MAX_MEMORY_USAGE / 1024 / 1024} MB. Restarting server...`
            );
            clearInterval(memoryCheckInterval);
            main.kill("SIGKILL");
        }
    },
        5000);

    const timeoutDuration = 30000;
    let lastResponseTime = Date.now();

    const timeoutCheckInterval = setInterval(() => {
        if (Date.now() - lastResponseTime > timeoutDuration) {
            console.error("Process unresponsive (ETIMEOUT). Restarting...");
            clearInterval(memoryCheckInterval);
            clearInterval(timeoutCheckInterval);
            main.kill("SIGKILL");
        }
    },
        5000);

    main.stdout?.on("data",
        () => {
            lastResponseTime = Date.now();
        });

    main.stderr?.on("data",
        () => {
            lastResponseTime = Date.now();
        });
}

start();

process.on("unhandledRejection", reason => console.log(reason));

process.on('uncaughtException', (err) => {
    if (err.code === 'ETIMEOUT') {
        chat.log('ETIMEOUT Occured Due to Network and Server Issues Proceed to Rebooting System...');
        process.exit(1);
    }
});