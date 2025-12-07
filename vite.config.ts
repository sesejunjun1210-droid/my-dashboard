import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ✅ root: 'src'  <<< 이 줄이 있으면 반드시 삭제
})
