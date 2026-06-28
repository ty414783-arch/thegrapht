import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';

export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false, // Keep readable during dev
    lib: {
      entry: path.resolve(__dirname, 'src/client/index.tsx'),
      formats: ['iife'],
      name: 'TheGraphT',
      fileName: () => 'app.js'
    },
    rollupOptions: {
      // livekit-client is loaded as a CDN <script> tag at runtime, not bundled.
      external: ['livekit-client'],
    }
  }
});
