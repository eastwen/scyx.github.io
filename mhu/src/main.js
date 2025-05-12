import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router' // 导入路由

createApp(App).use(ElementPlus).use(router).mount('#app') // 使用路由
