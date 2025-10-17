const { execSync } = require('child_process');

const port = process.argv[2] || 3000;

try {
  // Find process on Windows
  const command = process.platform === 'win32'
    ? `netstat -ano | findstr :${port}`
    : `lsof -ti:${port}`;

  const result = execSync(command, { encoding: 'utf8' });

  if (result) {
    // Extract PID from netstat output
    const lines = result.trim().split('\n');
    const pids = new Set();

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 0) {
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    }

    // Kill each process
    for (const pid of pids) {
      try {
        const killCommand = process.platform === 'win32'
          ? `taskkill /F /PID ${pid}`
          : `kill -9 ${pid}`;

        execSync(killCommand, { stdio: 'ignore' });
        console.log(`Killed process ${pid} on port ${port}`);
      } catch (err) {
        // Process might already be dead
      }
    }
  }
} catch (err) {
  // No process found on port - this is fine
  console.log(`Port ${port} is available`);
}
