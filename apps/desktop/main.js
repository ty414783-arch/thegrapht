const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, ipcMain, shell, Tray, Menu } = require('electron');

const isDev = !app.isPackaged;
const DEV_SERVER_URL = process.env.TG_DESKTOP_DEV_URL || 'http://127.0.0.1:5173';

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.setAppUserModelId("su.thegrapht.desktop");

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1420,
      height: 920,
      minWidth: 1000,
      minHeight: 650,
      frame: false,
      show: false,
      title: 'TheGraphT',
      icon: path.join(__dirname, 'icon.png'),
      backgroundColor: '#050913',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: false
      }
    });

    mainWindow.once('ready-to-show', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
      }
    });

    if (isDev) {
      mainWindow.loadURL(DEV_SERVER_URL).catch(() => {
        const hintHtml = `
          <html>
            <body style="font-family: Arial,sans-serif;background:#111827;color:#e5e7eb;display:grid;place-items:center;height:100vh;margin:0;">
              <div style="max-width:640px;padding:28px;border:1px solid #374151;border-radius:16px;background:#0f172a;">
                <h2 style="margin:0 0 10px;">Frontend dev server is not running</h2>
                <p style="margin:0;line-height:1.5;">Run <code>npm run init-frontend</code> (or <code>npm run dev</code>) inside <code>apps/desktop</code> and reopen the app.</p>
              </div>
            </body>
          </html>
        `;
        mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(hintHtml)}`);
      });
    } else {
      const rendererPath = path.join(__dirname, 'dist', 'renderer', 'index.html');
      if (fs.existsSync(rendererPath)) {
        mainWindow.loadFile(rendererPath);
      } else {
        const hintHtml = `
          <html>
            <body style="font-family: Arial,sans-serif;background:#111827;color:#e5e7eb;display:grid;place-items:center;height:100vh;margin:0;">
              <div style="max-width:640px;padding:28px;border:1px solid #374151;border-radius:16px;background:#0f172a;">
                <h2 style="margin:0 0 10px;">Renderer build not found</h2>
                <p style="margin:0;line-height:1.5;">Run <code>npm run build:renderer</code> inside <code>apps/desktop</code> before launching packaged mode.</p>
              </div>
            </body>
          </html>
        `;
        mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(hintHtml)}`);
      }
    }

    mainWindow.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // Block standard reload hotkeys and devtools in production
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F5' || ((input.control || input.meta) && input.key.toLowerCase() === 'r')) {
        event.preventDefault();
      }
      if (!isDev) {
        if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
          event.preventDefault();
        }
      }
    });
  }

  app.on('before-quit', () => {
    isQuitting = true;
  });

  app.whenReady().then(() => {
    createWindow();

    // Create System Tray icon
    const iconPath = path.join(__dirname, 'icon.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open TheGraphT', click: () => { if (mainWindow) mainWindow.show(); } },
      { type: 'separator' },
      { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('TheGraphT');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.focus();
        } else {
          mainWindow.show();
        }
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  ipcMain.on('window:update-app', () => {
    try {
      const https = require('node:https');
      const child_process = require('node:child_process');
      const latestYmlUrl = 'https://web.thegrapht.su/download/release/desktop/latest.yml';
      const tempDir = app.getPath('temp');

      https.get(latestYmlUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const match = data.match(/path:\s*([^\s]+)/i) || data.match(/url:\s*([^\s]+)/i);
          if (!match) return;
          const filename = match[1];
          const downloadUrl = `https://web.thegrapht.su/download/release/desktop/${filename}`;
          const localPath = path.join(tempDir, filename);

          const fileStream = fs.createWriteStream(localPath);
          https.get(downloadUrl, (downloadRes) => {
            downloadRes.pipe(fileStream);
            fileStream.on('finish', () => {
              fileStream.close();

              // Spawn the installer
              const child = child_process.spawn(localPath, [], {
                detached: true,
                stdio: 'ignore'
              });
              child.unref();

              // Close the app immediately
              isQuitting = true;
              app.quit();
            });
          }).on('error', (err) => {
            console.error("Download failed", err);
          });
        });
      }).on('error', (err) => {
        console.error("YML fetch failed", err);
      });
    } catch (error) {
      console.error("Updater failed", error);
    }
  });

  ipcMain.on('window:minimize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('window:toggle-maximize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  ipcMain.on('shell:open-external', (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle('window:is-maximized', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    return mainWindow.isMaximized();
  });
}
