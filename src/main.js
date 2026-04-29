import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/theme.css'
import './styles/main.css'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')