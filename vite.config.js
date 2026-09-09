import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// forMe — 모바일 우선 웹앱. 나중에 PWA 로 확장할 수 있도록 manifest / service worker 를 미리 둔다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})
