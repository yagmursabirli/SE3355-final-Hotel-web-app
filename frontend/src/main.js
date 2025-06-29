// frontend/src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store'; // Vuex store'u import et
import axios from 'axios'; // Axios'u import et

const app = createApp(App);

app.use(store); // Vuex'i kullan
app.use(router);

// Axios'u global olarak ekle (isteğe bağlı, ama pratik)
app.config.globalProperties.$axios = axios;
store.dispatch('initializeAuth');

app.mount('#app');