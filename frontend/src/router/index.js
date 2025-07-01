// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginPage from '../views/LoginPage.vue';
import HotelDetail from '../views/HotelDetail.vue';

const routes = [{
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    props: route => ({
      token: route.query.token,
      firstName: route.query.firstName,
      email: route.query.email,
    })
  },
  {
    path: '/hotel/:id', 
    name: 'hotel-detail',
    component: HotelDetail,
    props: true 
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;