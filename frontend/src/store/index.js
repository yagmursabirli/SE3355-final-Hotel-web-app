// frontend/src/store/index.js
import { createStore } from 'vuex';
import axios from 'axios'; 

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000';

const store = createStore({
  state() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null, 
      token: localStorage.getItem('token') || null, 
      userName: localStorage.getItem('userName') || 'Guest', 
      isAuthenticated: !!localStorage.getItem('token') 
    };
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.userName = user ? user.firstName : 'Guest'; 
      state.isAuthenticated = !!user; 
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userName', user.firstName);
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
      }
    },
    SET_TOKEN(state, token) {
      state.token = token;
      state.isAuthenticated = !!token; 
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    AUTH_SUCCESS(state, { token, user }) {
      state.token = token;
      state.user = user;
      state.userName = user ? user.firstName : 'Guest';
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userName', user.firstName);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
    },
    LOGOUT(state) {
      state.user = null;
      state.token = null;
      state.userName = 'Guest';
      state.isAuthenticated = false;
      localStorage.clear(); 
      delete axios.defaults.headers.common['Authorization'];
    }
  },
  actions: {
    async registerUser(_, userData) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/register`, userData);
        return response.data; 
      } catch (error) {
        console.error('Kayıt başarısız:', error.response?.data?.message || error.message);
        throw error; 
      }
    },
    async loginUser({ commit }, credentials) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
        const { token, user } = response.data;
        commit('AUTH_SUCCESS', { token, user }); 
        return response.data;
      } catch (error) {
        console.error('Giriş başarısız:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    googleLoginSuccess({ commit }, { token, user }) {
      commit('AUTH_SUCCESS', { token, user });
    },
    async logout({ commit }) {
      try {
        await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true }); 
        console.log('Backend logout başarılı');
      } catch (error) {
        console.error('Backend logout sırasında hata:', error.response?.data?.message || error.message);
      } finally {
        commit('LOGOUT');
      }
    },
    initializeAuth({ commit }) {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (token && user) {
        commit('AUTH_SUCCESS', { token, user });
      }
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.isAuthenticated;
    },
    userName(state) {
      return state.userName;
    },
    user(state) {
        return state.user;
    },
    token(state) {
        return state.token;
    }
  }
});


export default store;