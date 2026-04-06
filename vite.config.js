import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'// 引入path模块
// 1. 导入自动导入组件的插件
import Components from 'unplugin-vue-components/vite'
// 2. 导入 Element Plus 的解析器
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  server:{
    open:true,//自动打开浏览器
    port:8080
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')// 将@配置表示src目录
    }
  },
  plugins: [
    vue(),
    // 3. 添加插件配置
    Components({
      resolvers: [ElementPlusResolver()], // 让插件自动识别 Element Plus 组件
    }),
  ],
  base: './',
  build: {
    outDir: 'docs'   // 打包到 docs 文件夹
  },
})
