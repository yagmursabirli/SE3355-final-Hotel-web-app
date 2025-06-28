// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginPage from '../views/LoginPage.vue';
import HotelDetail from '../views/HotelDetail.vue';
//import RegisterPage from '../views/RegisterPage.vue'; // Yeni kayıt sayfası

const routes = [{
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/hotel/:id', // Dinamik rota, otel ID'si ile detay sayfası
    name: 'hotel-detail',
    component: HotelDetail,
    props: true // Route params'ı component props olarak geçirmek için
  },
  // Diğer rotalar buraya eklenebilir (örn. rezervasyonlarım, profil vb.)
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;