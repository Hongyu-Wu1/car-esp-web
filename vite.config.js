import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 子路径部署：仓库名 car-esp-web → https://<user>.github.io/car-esp-web/
  // 若改为用户主页仓库（<user>.github.io）则此处应设 base: '/'
  base: '/car-esp-web/',
})
