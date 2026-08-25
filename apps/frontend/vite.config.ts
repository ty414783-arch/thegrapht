import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "@thegrapht/thg-protocol": path.resolve(__dirname, "../thg-protocol/src/index.js")
    }
  },
  build: {
    manifest: true,
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/client/main.tsx'),
      // livekit-client is loaded as a CDN <script> tag at runtime, not bundled.
      external: ['livekit-client'],
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules/preact') || id.includes('node_modules/@preact')) {
            return 'vendor';
          }
          if (id.includes('/services/calls/')) {
            return 'calls';
          }
          if (id.includes('/services/search.ts')) {
            return 'search';
          }
          if (id.includes('/services/viewer-modal.ts') || id.includes('/services/attachment-modal.ts') || id.includes('/services/audio-player.ts')) {
            return 'media';
          }
          if (id.includes('/services/secure.ts')) {
            return 'secure';
          }
          if (
            id.includes('/services/bootstrap.ts')
            || id.includes('/services/sidebar.ts')
            || id.includes('/services/message-rendering.ts')
            || id.includes('/services/realtime-connection.ts')
            || id.includes('/services/workspace-state.ts')
            || id.includes('/services/auth.ts')
          ) {
            return 'chat-core';
          }
        }
      }
    }
  }
});
