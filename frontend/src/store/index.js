// frontend/src/store/index.js
import { createStore } from 'vuex';
import axios from 'axios'; // Axios'u import et

// API URL'ini environment değişkenlerinden al
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000';

const store = createStore({
  state() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null, // localStorage'dan kullanıcıyı yükle
      token: localStorage.getItem('token') || null, // localStorage'dan token'ı yükle
      userName: localStorage.getItem('userName') || 'Guest', // localStorage'dan userName'i yükle
      isAuthenticated: !!localStorage.getItem('token') // Token varsa doğrulanmış say
    };
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.userName = user ? user.firstName : 'Guest'; // Kullanıcı varsa adını, yoksa 'Guest' yap
      state.isAuthenticated = !!user; // Kullanıcı varsa doğrulanmış say
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
      state.isAuthenticated = !!token; // Token varsa doğrulanmış say
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    // Yeni MUTATION: Kullanıcı ve token'ı birlikte ayarlar
    AUTH_SUCCESS(state, { token, user }) {
      state.token = token;
      state.user = user;
      state.userName = user ? user.firstName : 'Guest';
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userName', user.firstName); // Adı da kaydet
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Axios varsayılan başlığını ayarla
    },
    LOGOUT(state) {
      state.user = null;
      state.token = null;
      state.userName = 'Guest';
      state.isAuthenticated = false;
      localStorage.clear(); // Tüm localStorage'ı temizle
      delete axios.defaults.headers.common['Authorization']; // Axios başlığını temizle
    }
  },
  actions: {
    async registerUser(_, userData) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/register`, userData);
        // Kayıt başarılıysa, kullanıcıyı otomatik olarak giriş yapmış saymıyoruz.
        // Kullanıcının login formunu doldurup giriş yapması beklenecek.
        return response.data; // Başarı mesajını veya veriyi döndür
      } catch (error) {
        console.error('Kayıt başarısız:', error.response?.data?.message || error.message);
        throw error; // Hatanın component'e yayılmasını sağla
      }
    },
    async loginUser({ commit }, credentials) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
        const { token, user } = response.data;
        commit('AUTH_SUCCESS', { token, user }); // Yeni mutation'ı kullan
        return response.data;
      } catch (error) {
        console.error('Giriş başarısız:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    // YENİ ACTION: Google ile başarılı giriş sonrası token ve kullanıcıyı yönet
    googleLoginSuccess({ commit }, { token, user }) {
      commit('AUTH_SUCCESS', { token, user });
    },
    async logout({ commit }) {
      try {
        // Backend'e logout isteği gönder (Passport oturumunu sonlandırmak için)
        // Eğer backend oturumunu kullanmıyorsanız bu satırı kaldırabilirsiniz
        await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true }); // withCredentials: true oturum çerezini gönderir
        console.log('Backend logout başarılı');
      } catch (error) {
        console.error('Backend logout sırasında hata:', error.response?.data?.message || error.message);
        // Hata olsa bile frontend'de logout işlemini tamamla
      } finally {
        commit('LOGOUT');
      }
    },
    // Yeniden yüklendiğinde veya uygulamaya girildiğinde oturum kontrolü
    initializeAuth({ commit }) {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (token && user) {
        // Token'ın geçerliliğini kontrol et (isteğe bağlı, backend'e istek atılabilir)
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

// Uygulama yüklendiğinde authentication durumunu başlat
//store.dispatch('initializeAuth');

export default store;