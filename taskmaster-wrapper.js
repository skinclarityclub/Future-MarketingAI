#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

console.error("Starting Taskmaster wrapper...");

// Find npx executable with proper escaping
function findWorkingNpx() {
  if (os.platform() === "win32") {
    const possiblePaths = [
      // Try short paths first (no spaces)
      "C:\\PROGRA~1\\nodejs\\npx.cmd",
      "C:\\PROGRA~2\\nodejs\\npx.cmd",
      // Then try quoted paths
      '"C:\\Program Files\\nodejs\\npx.cmd"',
      '"C:\\Program Files (x86)\\nodejs\\npx.cmd"',
      // Finally try simple command
      "npx.cmd",
      "npx",
    ];

    for (const npxPath of possiblePaths) {
      try {
        // Remove quotes for existence check
        const checkPath = npxPath.replace(/"/g, "");
        if (fs.existsSync(checkPath)) {
          console.error(`Found npx at: ${npxPath}`);
          return npxPath;
        }
      } catch (e) {
        // Continue to next path
        continue;
      }
    }

    // Fallback: try to use PATH
    return "npx";
  }

  return "npx";
}

// Alternative approach: use PowerShell to execute npx
function startWithPowerShell() {
  console.error("Using PowerShell approach...");

  const psCommand = "npx task-master-ai --stdio";

  const taskmaster = spawn("pwsh", ["-Command", psCommand], {
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });

  return taskmaster;
}

// Try direct approach first, fallback to PowerShell
let taskmaster;
const npxPath = findWorkingNpx();

console.error(`Attempting to use: ${npxPath}`);

try {
  // Try direct npx approach
  taskmaster = spawn(npxPath, ["task-master-ai", "--stdio"], {
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });

  // Check if spawn was successful
  taskmaster.on("error", error => {
    console.error("Direct approach failed, trying PowerShell...");
    // Kill current process and try PowerShell
    taskmaster.kill();
    taskmaster = startWithPowerShell();
    setupTaskmasterHandlers();
  });
} catch (error) {
  console.error("Direct spawn failed, using PowerShell approach...");
  taskmaster = startWithPowerShell();
}

function setupTaskmasterHandlers() {
  // Handle startup errors
  taskmaster.on("error", error => {
    console.error("Failed to start Taskmaster:", error);
    process.exit(1);
  });

  // Forward stdin to taskmaster
  process.stdin.on("data", data => {
    try {
      const input = data.toString().trim();
      if (input) {
        // Validate JSON before forwarding
        JSON.parse(input);
        taskmaster.stdin.write(data);
      }
    } catch (error) {
      console.error("Invalid JSON input:", error.message);
    }
  });

  // Forward taskmaster output to stdout
  taskmaster.stdout.on("data", data => {
    process.stdout.write(data);
  });

  // Handle errors from taskmaster
  taskmaster.stderr.on("data", data => {
    const errorText = data.toString();
    console.error("Taskmaster stderr:", errorText);

    // If we see path errors, try PowerShell approach
    if (errorText.includes("is not recognized") && !taskmaster.usedPowerShell) {
      console.error("Switching to PowerShell approach...");
      taskmaster.kill();
      taskmaster = startWithPowerShell();
      taskmaster.usedPowerShell = true;
      setupTaskmasterHandlers();
    }
  });

  // Handle process exit
  taskmaster.on("close", code => {
    console.error(`Taskmaster exited with code ${code}`);
    process.exit(code);
  });
}

// Setup handlers
setupTaskmasterHandlers();

// Handle script termination
process.on("SIGINT", () => {
  console.error("Wrapper received SIGINT, terminating...");
  if (taskmaster) taskmaster.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("Wrapper received SIGTERM, terminating...");
  if (taskmaster) taskmaster.kill();
  process.exit(0);
});
