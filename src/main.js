import { createApp } from 'vue'
import './styles/theme.css'
import App from './App.vue'
import router from './router' // Importamos la carpeta /router/index.js que creamos

const app = createApp(App)

app.use(router) // Le decimos a la app que use el sistema de rutas
app.mount('#app')