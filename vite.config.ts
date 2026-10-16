import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'firebase/app': path.resolve(__dirname, 'src/lib/clientDb.ts'),
      'firebase/firestore': path.resolve(__dirname, 'src/lib/clientDb.ts'),
      'firebase/storage': path.resolve(__dirname, 'src/lib/clientDb.ts'),
      'firebase/auth': path.resolve(__dirname, 'src/lib/clientDb.ts')
    }
  },
  server: {
    port: 5174,
    strictPort: false
  }
});
