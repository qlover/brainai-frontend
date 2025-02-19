import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      // 支持 preact 的信号
      // see: https://github.com/preactjs/signals-react-transform
      babel: {
        plugins: [['module:@preact/signals-react-transform']]
      }
    }),
    tailwindcss()
  ],

  server: {
    port: 3900,
    host: true,
    strictPort: true
  },
  base: '/reactflow/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}']
  }
});
