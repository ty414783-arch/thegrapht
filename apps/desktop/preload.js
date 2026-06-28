const { contextBridge, ipcRenderer } = require('electron');
const { version } = require('./package.json');
const path = require('node:path');

const defaultApiBase = 'https://web.thegrapht.su/api';
const defaultWsBase = 'wss://web.thegrapht.su/ws';

contextBridge.exposeInMainWorld('tgDesktop', {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    updateApp: () => ipcRenderer.send('window:update-app'),
    cancelUpdate: () => ipcRenderer.send('window:cancel-update')
  },
  shell: {
    openExternal: (url) => ipcRenderer.send('shell:open-external', url)
  },
  config: {
    version: version,
    apiBase: process.env.TG_DESKTOP_API_BASE || defaultApiBase,
    wsBase: process.env.TG_DESKTOP_WS_BASE || defaultWsBase,
    appleEmojiAssetBaseUrl: `file:///${path.join(__dirname, 'dist', 'renderer', 'assets', 'emoji', 'apple-64').replace(/\\/g, '/')}/`
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update:progress', (event, percent) => callback(percent));
  },
  onUpdateState: (callback) => {
    ipcRenderer.on('update:state', (event, state) => callback(state));
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update:error', (event, message) => callback(message));
  },
  onUpdateCancelled: (callback) => {
    ipcRenderer.on('update:cancelled', () => callback());
  }
});
