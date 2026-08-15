import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// 多页面应用配置：首页 + 任务详情页
export default defineConfig({
  plugins: [react()],
  base: './',  // 相对路径，方便部署到任意子路径
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        task: resolve(__dirname, 'task.html'),
      },
    },
    chunkSizeWarningLimit: 1500,  // maplibre-gl + pmtiles 比较大
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false,
  },
});