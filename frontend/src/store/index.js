// frontend/src/store/index.js
import { createStore } from 'vuex';
import axios from 'axios';

// Backend'in auth rotalarına işaret eden API ana yolu
const API_AUTH_URL = 'http://localhost:3000/api/auth'; 

export default createStore({
  state() {
    return {
      isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
      firstName: localStorage.getItem('firstName') || null,
      userToken: localStorage.getItem('userToken') || null,
      user: JSON.parse(localStorage.getItem('userData')) || null,
    };
  },
  getters: {
    isLoggedIn: state => state.isLoggedIn,
    userName: state => state.firstName,
    userToken: state => state.userToken,
    currentUser: state => state.user,
  },
  mutations: {
    SET_AUTH(state, { user, token }) {
      state.isLoggedIn = true;
      state.firstName = user.firstName;
      state.userToken = token;
      state.user = user;
      
      // LocalStorage'a kaydet
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('firstName', user.firstName);
      localStorage.setItem('userToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
    },
    LOGOUT(state) {
      state.isLoggedIn = false;
      state.firstName = null;
      state.userToken = null;
      state.user = null;
      // LocalStorage'dan sil
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('firstName');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    }
  },

  actions: {
    initializeAuth({ commit }) {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          commit('SET_AUTH', { user, token }); 
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (e) {
          console.error("Failed to parse user data from localStorage or token invalid:", e);
          commit('LOGOUT');
        }
      }
    },

    async loginUser({ commit }, credentials) { // <-- BURAYA { commit } EKLENDİ!
      try {
        const response = await axios.post(`${API_AUTH_URL}/login`, credentials); 
        const { token, user } = response.data;
        commit('SET_AUTH', { user, token }); // <-- BU SATIR YORUMDAN ÇIKARILDI!
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      } catch (error) {
        console.error('Giriş hatası:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    async registerUser(_, userData) { // <-- BURAYA DA { commit } EKLENDİ!
      // eslint-disable-next-line no-unused-vars 
      try {
        const response = await axios.post(`${API_AUTH_URL}/register`, userData); 
        console.log('Kayıt başarılı yanıtı:', response.data);
        return response.data;
      } catch (error) {
        console.error('Kayıt hatası:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    logoutUser({ commit }) { 
      commit('LOGOUT');
      delete axios.defaults.headers.common['Authorization'];
    },
  },
});