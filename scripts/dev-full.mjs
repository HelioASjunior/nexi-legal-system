import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

function runScript(name) {
  const command = isWindows ? 'cmd.exe' : 'npm';
  const args = isWindows
    ? ['/d', '/s', '/c', 'npm', 'run', name]
    : ['run', name];

  return spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    cwd: process.cwd(),
    env: process.env,
  });
}

const api = runScript('api');
const web = runScript('dev');

const closeAll = (signal = 'SIGTERM') => {
  if (!api.killed) api.kill(signal);
  if (!web.killed) web.kill(signal);
};

api.on('exit', (code) => {
  if (code && code !== 0) {
    console.error('[dev:full] API encerrada com erro.');
    closeAll();
    process.exit(code);
  }
});

web.on('exit', (code) => {
  closeAll();
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  closeAll('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeAll('SIGTERM');
  process.exit(0);
});
