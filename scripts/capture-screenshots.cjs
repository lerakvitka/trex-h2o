const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { spawn } = require('child_process');

const OUT = path.resolve(__dirname, '..', 'media', 'case-study');
const VITE_URL = 'http://localhost:5173';
const VITE_PORT = 5173;

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

async function captureWindow(win, outName) {
  const wc = win.webContents;
  const rect = await wc.executeJavaScript(`(() => {
    const el = document.querySelector('.modal') || document.querySelector('.window');
    const r = el.getBoundingClientRect();
    return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
  })()`);
  const PAD = 16;
  const padded = {
    x: Math.max(0, rect.x - PAD),
    y: Math.max(0, rect.y - PAD),
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };
  const img = await wc.capturePage(padded);
  const png = img.toPNG();
  fs.writeFileSync(path.join(OUT, outName), png);
  console.log('  wrote', outName, `(${png.length} bytes)`);
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
    width: 720,
    height: 900,
    show: false,
    paintWhenInitiallyHidden: true,
    backgroundColor: '#f7c8a8',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await win.loadURL(VITE_URL);
  win.webContents.setZoomFactor(1);
  await delay(1500);

  // app-idle.png
  await captureWindow(win, 'app-idle.png');

  // app-reminding.png
  await win.webContents.executeJavaScript('window.__forceRemind && window.__forceRemind()');
  await delay(700);
  await captureWindow(win, 'app-reminding.png');

  // app-hats.png — reload to clean state, then click HATS
  await win.loadURL(VITE_URL);
  win.webContents.setZoomFactor(1);
  await delay(1500);
  await win.webContents.executeJavaScript(`(() => {
    const buttons = [...document.querySelectorAll('button')];
    const hatsBtn = buttons.find(b => b.textContent.trim() === 'HATS');
    hatsBtn.click();
  })()`);
  await delay(500);
  await captureWindow(win, 'app-hats.png');

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
