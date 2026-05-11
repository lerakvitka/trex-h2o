const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { spawn } = require('child_process');

const OUT = path.resolve(__dirname, '..', 'media', 'verify');
const VITE_URL = 'http://localhost:5173';
const VITE_PORT = 5173;

const WIN_W = 340;
const WIN_H = 470;
const ZOOM = 0.6;

function checkPort(port) {
  return new Promise((resolve) => {
    const sock = net.createConnection(port, '127.0.0.1');
    sock.once('connect', () => { sock.end(); resolve(true); });
    sock.once('error', () => resolve(false));
  });
}

function spawnVite() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'dev:vite'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
      shell: true,
    });
    let resolved = false;
    proc.stdout.on('data', (d) => {
      const s = d.toString();
      process.stdout.write('[vite] ' + s);
      if (!resolved && /ready in/.test(s)) {
        resolved = true;
        resolve(proc);
      }
    });
    proc.stderr.on('data', (d) => process.stderr.write('[vite] ' + d.toString()));
    proc.on('exit', (code) => {
      if (!resolved) reject(new Error('vite exited before ready, code=' + code));
    });
    setTimeout(() => {
      if (!resolved) reject(new Error('vite ready timeout (30s)'));
    }, 30000);
  });
}

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  let viteProc = null;
  if (!(await checkPort(VITE_PORT))) {
    console.log('vite not running on', VITE_PORT, '— spawning...');
    viteProc = await spawnVite();
  } else {
    console.log('reusing existing vite on', VITE_PORT);
  }

  const win = new BrowserWindow({
    width: WIN_W,
    height: WIN_H,
    show: false,
    paintWhenInitiallyHidden: true,
    backgroundColor: '#f7c8a8',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await win.loadURL(VITE_URL);
  win.webContents.setZoomFactor(ZOOM);
  await delay(1500);

  const img = await win.webContents.capturePage();
  const png = img.toPNG();
  const outPath = path.join(OUT, 'window-full.png');
  fs.writeFileSync(outPath, png);
  console.log('  wrote', outPath, `(${png.length} bytes)`);

  win.close();

  if (viteProc) {
    console.log('killing spawned vite');
    viteProc.kill();
  }
  app.quit();
}

app.whenReady().then(() => {
  main().catch((e) => {
    console.error(e);
    app.exit(1);
  });
});
