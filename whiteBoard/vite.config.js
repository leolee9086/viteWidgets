import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
    plugins: [
      vue(),
      ],
    base: './',
    server:{
      proxy:{
        "/stage":{
          target:"http://127.0.0.1:6806/stage",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/stage/, '')
        },
        "/stage/js":{
          target:"http://127.0.0.1:6806/stage/js",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/stage/, '')
        },
        "/widgets":{
          target:"http://127.0.0.1:6806/widgets",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/widgets/, '')
        },
  
        "/api":{
          target:"http://127.0.0.1:6806/api",
          changeOrigin: true,
         rewrite: path => path.replace(/^\/api/, '')
        },
        "/assets":{
          target:"http://127.0.0.1:6806/assets",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/assets/, '')
        },
        "/appearance":{
          target:"http://127.0.0.1:6806/appearance",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/appearance/, '')
        },
        "/snippets":{
          target:"http://127.0.0.1:6806/snippets",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/snippets/, '')
        },
        "/ws":{
          target:"ws://127.0.0.1:6806/ws",
          changeOrigin: true,
          ws:true,
        rewrite: path => path.replace(/^\/ws/, '')
        },
      
  
      },
      cors: {
        allowedHeaders:['Content-Type', 'Authorization']
      },
      hmr:{
        overlay:true
      },
    },
    resolve:{alias:[]}
  })
  