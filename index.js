const { spawn } = require("child_process");
const path = require('path');

const SCRIPT_FILE = "kokoro.js"; // your main file
const SCRIPT_PATH = path.join(__dirname, SCRIPT_FILE);

const MAX_MEMORY_USAGE = 1000 * 1024 * 1024; // 1000 MB

function start() {
        const main = spawn("node", [SCRIPT_PATH], {
                cwd: __dirname,
                stdio: "inherit",
                shell: true
        });

        main.on("error", (err) => {
                console.error("Error occurred:", err);
        });

        main.on("close", (exitCode) => {
                if (exitCode === 0) {
                        console.log(`STATUS: [${exitCode}] - Process Exited > SYSTEM Rebooting!...`);
                        start();
                } else if (exitCode === 1) {
                        console.log(`ERROR: [${exitCode}] - System Rebooting!...`);
                        start();
                } else if (exitCode === 137) {
                        console.log(`POTENTIAL DDOS: [${exitCode}] - Out Of Memory Restarting...`);
                        start();
                } else {
                        console.error(`[${exitCode}] - Process Exited!`);
                }
        });

        // Monitor memory usage
        const memoryCheckInterval = setInterval(() => {
                const memoryUsage = process.memoryUsage().heapUsed;
              /*  console.log(`Current memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB`);*/

                if (memoryUsage > MAX_MEMORY_USAGE) {
                        console.error(`Memory usage exceeded ${MAX_MEMORY_USAGE / 1024 / 1024} MB. Restarting server...`);
                        clearInterval(memoryCheckInterval);
                        main.kill('SIGKILL');
                }
        }, 5000);
}

start();
