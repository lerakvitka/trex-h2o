const { app, BrowserWindow, Menu, screen } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

const ZOOM = 0.6;
const WIN_W = 340;
const WIN_H = 500;
const BOTTOM_MARGIN = 8;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = display.workAreaSize;
  const x = Math.round((sw - WIN_W) / 2);
  const y = Math.max(0, sh - WIN_H - BOTTOM_MARGIN);

  const win = new BrowserWindow({
    width: WIN_W,
    height: WIN_H,
    x,
    y,
    resizable: false,
    alwaysOnTop: true,
    title: 'T-Rex H2O',
    backgroundColor: '#f7c8a8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomFactor(ZOOM);
  });

  Menu.setApplicationMenu(null);

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
