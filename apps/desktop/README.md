# TheGrapht Desktop (Electron + React + Vite)

## Structure

- `main.js` - Electron main process
- `preload.js` - secure bridge (`contextIsolation: true`)
- `index.html` - Vite entry
- `vite.config.js` - renderer build config
- `src/` - React desktop client

## Run (development)

```bash
npm install
npm run dev
```

Or separate terminals:

```bash
npm run init-frontend
npm run start
```

## Build renderer

```bash
npm run build:renderer
```

## Build tiny web installer (NSIS Web)

```bash
npm run dist
```

This target generates a bootstrap installer (`nsis-web`) that is small and downloads full app payload during install.

## API / WebSocket

Configured in preload bridge (`window.tgDesktop.config`):

- API: `https://thegrapht.su/api`
- WS: `wss://web.thegrapht.su/ws`

Override with env:

- `TG_DESKTOP_API_BASE`
- `TG_DESKTOP_WS_BASE`
- `TG_DESKTOP_DEV_URL`
