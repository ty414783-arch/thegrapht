# Building and Packaging the Desktop Client

This guide explains how to compile the frontend renderer assets, package them into the native Electron installer (NSIS Windows Setup EXE), and deploy updates.

---

## 1. Prerequisites

Ensure you have Node.js (v18+) and all desktop workspace dependencies installed:

```bash
cd apps/desktop
npm install
```

---

## 2. Compile the Renderer Assets

The desktop app packages the website frontend source directly into Electron. Run the renderer build script to fetch, build, and package the static client bundle into `dist/renderer`:

```bash
npm run build:renderer
```

This runs the script [build-frontend.mjs](file:///root/thegrapht-dev/apps/desktop/build-frontend.mjs), which:
1. Imports frontend template layout components.
2. Bundles the app JS client.
3. Injects custom desktop titlebar CSS/HTML and logic.
4. Copies binary assets (fonts, icons, sound cues, matrix backgrounds).

---

## 3. Package the NSIS Installer

To package the application into a single executable installer (`TheGrapht-Setup-*.exe`) and generate auto-update definitions (`latest.yml`), run:

```bash
npm run dist
```

Output files will be generated under the `dist/` directory:
- `TheGrapht-Setup-0.2.29.exe` — Windows 64-bit installer setup.
- `latest.yml` — auto-update manifest containing the installer filename, hash, and version.

---

## 4. Deploying Updates

To deploy the compiled installer and auto-update configs to the production environment, copy them to the public resources folder:

```bash
# Copy setup binary and metadata descriptor to public production download folders
cp apps/desktop/dist/TheGrapht-Setup-0.2.29.exe* apps/desktop/dist/latest.yml /root/thegrapht/res/download/release/desktop/
```

Once copied, files are instantly accessible for downloading and auto-updating at:
- Download Link: `https://web.thegrapht.su/download/release/desktop/TheGrapht-Setup-0.2.29.exe`
- Auto-Update Manifest: `https://web.thegrapht.su/download/release/desktop/latest.yml`

---

## 5. Custom Dynamic Titlebar Architecture

To support premium custom window frames on Windows, the native window is configured with `frame: false` in [main.js](file:///root/thegrapht-dev/apps/desktop/main.js). The custom titlebar is styled with `-webkit-app-region: drag` and populated dynamically at runtime:

- **Direct Messages / Home**: Always displays the Discord-like chat logo and "Личные сообщения". The recipient's name is kept private and hidden from the OS window header.
- **Groups / Channels**: Displays the group name along with its small circular group photo/avatar.
- **Auto-Sync**: Triggered inside `renderMessages` ([sidebar.ts](file:///root/thegrapht-dev/apps/frontend/src/client/services/sidebar.ts)) and updated dynamically whenever group properties change ([profile-panel.ts](file:///root/thegrapht-dev/apps/frontend/src/client/services/profile-panel.ts)).
