import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  // Create a define object to expose env variables
  const envWithProcessPrefix = Object.entries(env).reduce(
    (prev, [key, val]) => {
      // Only expose variables prefixed with VITE_
      if (key.startsWith('VITE_')) {
        return {
          ...prev,
          [`process.env.${key}`]: JSON.stringify(val),
        };
      }
      return prev;
    },
    {}
  );

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    define: envWithProcessPrefix,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
