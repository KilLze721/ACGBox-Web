import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// 向公开站壳层提供主题状态和目录路由。
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
