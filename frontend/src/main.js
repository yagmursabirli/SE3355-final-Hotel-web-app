// frontend/src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';

// Axios'a Base URL'i ayarlayın
// process.env.VUE_APP_API_URL değişkeni Render'da frontend servisi için ayarlanmış olmalı!
axios.defaults.baseURL = process.env.VUE_APP_API_URL;
axios.defaults.withCredentials = true; // CORS için credentials göndermek önemli

const app = createApp(App);

app.use(store);
app.use(router);

app.config.globalProperties.$axios = axios; // Artık bu $axios instance'ı baseURL ayarlı olacak
store.dispatch('initializeAuth');

app.mount('#app');