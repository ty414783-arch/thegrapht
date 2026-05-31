import { logoUrl } from "./assets.js";

export const manifestUrl = "/manifest.webmanifest";
export const serviceWorkerUrl = "/sw.js";

export const manifestJson = JSON.stringify({
  name: "TheGraphT Web",
  short_name: "TheGraphT Web",
  description: "TheGrapht messenger",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#171b22",
  theme_color: "#171b22",
  icons: [
    {
      src: logoUrl,
      sizes: "512x512",
      type: "image/jpeg",
      purpose: "any"
    }
  ]
});

export const serviceWorkerScript = `
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then((clients) => Promise.all(clients.map((client) => client.navigate(client.url))))
  );
});

self.addEventListener("fetch", () => {});
`.trim();
