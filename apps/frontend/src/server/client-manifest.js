import fs from "node:fs";
import path from "node:path";

export const resolveDistDir = (baseDir) => {
  const candidates = [
    path.resolve(baseDir, "../dist"),
    path.resolve(process.cwd(), "apps/frontend/dist"),
    path.resolve(process.cwd(), "dist")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  return candidates[0];
};

export const loadClientManifest = (distDir) => {
  const manifestPath = path.join(distDir, ".vite/manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return null;
  }
};

const findEntryChunk = (manifest) => {
  if (!manifest || typeof manifest !== "object") {
    return null;
  }

  const preferredKeys = [
    "src/client/main.tsx",
    "main.tsx"
  ];

  for (const key of preferredKeys) {
    if (manifest[key]?.isEntry) {
      return manifest[key];
    }
  }

  return Object.values(manifest).find((chunk) => chunk?.isEntry) || null;
};

const collectPreloadUrls = (manifest, entryKey, entryChunk) => {
  const visited = new Set();
  const preloadUrls = [];

  const visit = (key) => {
    if (!key || visited.has(key)) {
      return;
    }
    visited.add(key);

    const chunk = manifest[key];
    if (!chunk) {
      return;
    }

    if (chunk.file && key !== entryKey) {
      preloadUrls.push("/" + chunk.file);
    }

    for (const importedKey of chunk.imports || []) {
      visit(importedKey);
    }
  };

  for (const importedKey of entryChunk.imports || []) {
    visit(importedKey);
  }

  return [...new Set(preloadUrls)];
};

export const resolveClientAssets = (manifest) => {
  const entryChunk = findEntryChunk(manifest);
  if (!entryChunk?.file) {
    return null;
  }

  const entryKey = Object.entries(manifest).find(([, chunk]) => chunk === entryChunk)?.[0] || "";
  const entryUrl = "/" + entryChunk.file;
  const cssUrls = (entryChunk.css || []).map((file) => "/" + file);
  const preloadUrls = collectPreloadUrls(manifest, entryKey, entryChunk);
  const buildId = String(entryChunk.file)
    .replace(/^assets\//, "")
    .replace(/\.js$/, "");

  return {
    entryUrl,
    cssUrls,
    preloadUrls,
    buildId
  };
};

export const resolveAssetFilePath = (distDir, reqPath) => {
  const normalized = String(reqPath || "").split("?")[0];
  if (!normalized.startsWith("/assets/")) {
    return null;
  }

  const relativePath = normalized.replace(/^\//, "");
  const candidates = [
    path.join(distDir, relativePath),
    path.join(distDir, "assets", path.basename(relativePath)),
    path.join(distDir, "chunks", path.basename(relativePath))
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
};
