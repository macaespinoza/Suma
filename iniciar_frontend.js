const { spawn } = require('child_process');
const path = require('path');

const proc = spawn(
  'npx.cmd',
  ['next', 'dev', '-p', '3000'],
  {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'ignore',
    detached: true,
    shell: true,
  }
);

proc.unref();
console.log(`Frontend iniciado con PID: ${proc.pid}`);
process.exit(0);
