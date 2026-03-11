import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Création de l'application Vue
// - createApp crée une nouvelle instance Vue
// - use(router) intègre Vue Router pour la navigation
// - mount('#app') attache l'app au DOM (élément avec id="app")
createApp(App).use(router).mount('#app')
