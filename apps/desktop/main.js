const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, ipcMain, shell, Tray, Menu } = require('electron');

const isDev = !app.isPackaged;
const DEV_SERVER_URL = process.env.TG_DESKTOP_DEV_URL || 'http://127.0.0.1:5173';

let mainWindow = null;
let tray = null;
let isQuitting = false;
let latestUpdateInfo = null;
let activeUpdateRequest = null;
let latestUpdateState = null;

const semverParts = (value) => String(value || '').trim().replace(/^v/i, '').split('.').map((part) => {
  const parsed = parseInt(part, 10);
  return Number.isFinite(parsed) ? parsed : 0;
});

const isVersionNewer = (current, latest) => {
  const currentParts = semverParts(current);
  const latestParts = semverParts(latest);
  const length = Math.max(currentParts.length, latestParts.length);
  for (let index = 0; index < length; index += 1) {
    const currentPart = currentParts[index] || 0;
    const latestPart = latestParts[index] || 0;
    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }
  return false;
};

const sendUpdateState = (payload) => {
  latestUpdateState = payload || null;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:state', payload);
  }
};

const sendUpdateProgress = (percent) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:progress', percent);
  }
};

const sendUpdateError = (message) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:error', message);
  }
};

const checkForUpdate = () => {
  try {
    const https = require('node:https');
    const latestYmlUrl = 'https://web.thegrapht.su/download/release/desktop/latest.yml';
    https.get(latestYmlUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const versionMatch = data.match(/version:\s*([^\s]+)/i);
        const pathMatch = data.match(/path:\s*([^\s]+)/i);
        if (!versionMatch || !pathMatch) {
          sendUpdateState({ status: 'idle' });
          return;
        }
        const latestVersion = String(versionMatch[1]).trim();
        const filename = String(pathMatch[1]).trim();
        latestUpdateInfo = {
          version: latestVersion,
          filename,
          downloadUrl: `https://web.thegrapht.su/download/release/desktop/${filename}`
        };
        sendUpdateState(isVersionNewer(app.getVersion(), latestVersion)
          ? { status: 'available', version: latestVersion, currentVersion: app.getVersion() }
          : { status: 'current', version: app.getVersion() });
      });
    }).on('error', () => {
      sendUpdateState({ status: 'error', message: 'Update check failed.' });
    });
  } catch (error) {
    sendUpdateState({ status: 'error', message: 'Update check failed.' });
  }
};

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

    mainWindow.webContents.on('did-finish-load', () => {
      if (latestUpdateState) {
        mainWindow.webContents.send('update:state', latestUpdateState);
      }
    });

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
    checkForUpdate();

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
      const child_process = require('node:child_process');
      const tempDir = app.getPath('temp');
      const updateInfo = latestUpdateInfo;
      if (!updateInfo?.downloadUrl || !updateInfo?.filename) {
        checkForUpdate();
        return;
      }
      const localPath = path.join(tempDir, updateInfo.filename);

      const downloadFile = (url, destPath) => {
        const https = require('node:https');
        const fileStream = fs.createWriteStream(destPath);

        const request = https.get(url, (res) => {
          // Follow 301/302 redirects
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            fileStream.close();
            try { fs.unlinkSync(destPath); } catch (e) {}
            const redirectUrl = new URL(res.headers.location, url).toString();
            downloadFile(redirectUrl, destPath);
            return;
          }

          if (res.statusCode !== 200) {
            fileStream.close();
            try { fs.unlinkSync(destPath); } catch (e) {}
            const err = new Error(`HTTP status ${res.statusCode}`);
            activeUpdateRequest = null;
            sendUpdateState({ status: 'error', message: err.message });
            sendUpdateError(err.message);
            return;
          }

          const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
          let receivedBytes = 0;

          sendUpdateState({ status: 'downloading', version: updateInfo.version || app.getVersion(), progress: 0 });
          sendUpdateProgress(0);

          res.on('data', (chunk) => {
            receivedBytes += chunk.length;
            if (totalBytes > 0) {
              const percent = Math.round((receivedBytes / totalBytes) * 100);
              sendUpdateState({ status: 'downloading', version: updateInfo.version || app.getVersion(), progress: percent });
              sendUpdateProgress(percent);
            }
          });

          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close((err) => {
              activeUpdateRequest = null;
              if (err) {
                console.error("Stream close error", err);
                sendUpdateState({ status: 'error', message: 'Failed to save update.' });
                sendUpdateError('Failed to save update.');
                return;
              }

              sendUpdateState({ status: 'installing', version: updateInfo.version || app.getVersion(), progress: 100 });
              sendUpdateProgress(100);

              // Small delay to ensure OS releases locks before spawn
              setTimeout(() => {
                const child = child_process.spawn(localPath, [], {
                  detached: true,
                  stdio: 'ignore'
                });
                child.unref();
                isQuitting = true;
                app.quit();
              }, 250);
            });
          });
        });

        request.on('error', (err) => {
          fileStream.close();
          try { fs.unlinkSync(destPath); } catch (e) {}
          activeUpdateRequest = null;
          console.error("Download failed", err);
          sendUpdateState({ status: 'error', message: 'Download failed.' });
          sendUpdateError('Download failed.');
        });

        activeUpdateRequest = request;
      };

      downloadFile(updateInfo.downloadUrl, localPath);

    } catch (error) {
      console.error("Updater failed", error);
      sendUpdateState({ status: 'error', message: 'Updater failed.' });
      sendUpdateError('Updater failed.');
    }
  });

  ipcMain.on('window:cancel-update', () => {
    if (activeUpdateRequest) {
      activeUpdateRequest.destroy();
      activeUpdateRequest = null;
    }
    sendUpdateState({ status: 'cancelled' });
    sendUpdateState({ status: 'available', version: latestUpdateInfo?.version || app.getVersion(), progress: 0 });
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:cancelled');
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

  ipcMain.on('window:check-update', () => {
    checkForUpdate();
  });
}
