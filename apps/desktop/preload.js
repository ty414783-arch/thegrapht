const { contextBridge, ipcRenderer } = require('electron');
const { version } = require('./package.json');

const defaultApiBase = 'https://web.thegrapht.su/api';
const defaultWsBase = 'wss://web.thegrapht.su/ws';

contextBridge.exposeInMainWorld('tgDesktop', {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    updateApp: () => ipcRenderer.send('window:update-app')
  },
  shell: {
    openExternal: (url) => ipcRenderer.send('shell:open-external', url)
  },
  config: {
    version: version,
    apiBase: process.env.TG_DESKTOP_API_BASE || defaultApiBase,
    wsBase: process.env.TG_DESKTOP_WS_BASE || defaultWsBase
  }
});
