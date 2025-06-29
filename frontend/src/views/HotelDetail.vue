<template>
  <div class="hotel-detail-page" v-if="hotel">
 <header class="header">
      <div class="logo">Hotels.<span class="com-text">com</span></div>
      <div class="user-info"> <span v-if="isAuthenticated" class="welcome-message">
          Merhaba, {{ userName }}
        </span>
        <button v-else @click="navigateToLogin" class="login-button">
          Giriş yap
        </button>
        <button
          v-if="isAuthenticated"
          @click="handleLogout"
          class="logout-button"
        >
          Çıkış Yap
        </button>
      </div>
    </header>



    <div class="hotel-hero">
      <img :src="hotel.image_url || 'https://via.placeholder.com/800x400?text=Hotel+Image'" :alt="hotel.name" class="hotel-main-image">
      <h1>{{ hotel.name }}</h1>
      <p class="hotel-address">{{ hotel.address }}, {{ hotel.city }}</p>
      <div class="overall-rating">
        <span class="rating-score">{{ hotel.rating.toFixed(1) }}/10</span>
        <span class="rating-text">{{ getRatingText(hotel.rating) }}</span>
        <span class="comment-count">({{ hotel.totalComments }} yorum)</span>
      </div>
    </div>

    <section class="hotel-details-section">
      <h2>Otel Hakkında</h2>
      <p>{{ hotel.description || 'Bu otel hakkında açıklama bulunmamaktadır.' }}</p>

      <h3>Popüler Olanaklar</h3>
      <div class="amenities-list">
        <span v-for="amenity in hotel.amenitiesArray" :key="amenity" class="amenity-tag">
          <i class="icon"></i> {{ amenity }}
        </span>
      </div>

      <div class="price-info">
        <p v-if="hotel.discountPercentage" class="discounted-price">
          <span class="original-price-strikethrough">{{ (hotel.price / (1 - hotel.discountPercentage / 100)).toFixed(2) }} TL</span>
          <span class="discount-badge"> %{{ hotel.discountPercentage }} indirim</span>
        </p>
        <p class="current-price">{{ hotel.price.toFixed(2) }} TL <small>1 gece için vergiler ve ücretler dahildir</small></p>
        <p v-if="hotel.member_price && !isLoggedIn" class="member-price-cta">Üye fiyatından yararlanılabilir</p>
        <p v-if="hotel.member_price && isLoggedIn" class="member-price-display">Üye Fiyatı: {{ hotel.member_price.toFixed(2) }} TL</p>
      </div>

      <button class="book-now-button">Şimdi Rezervasyon Yap</button>
    </section>

    <section class="comments-section">
      <h2>Yorumlar ({{ comments.length }} doğrulanmış yorum)</h2>
      <div class="rating-breakdown" v-if="comments.length > 0">
        <h3>Puan Dağılımı</h3>
        <div class="rating-bar-group">
          <label>Temizlik:</label>
          <div class="bar-container">
            <div class="bar" :style="{ width: (avgRating.cleanlinessRating * 10) + '%' }"></div>
          </div>
          <span>{{ avgRating.cleanlinessRating }}/10</span>
        </div>
        <div class="rating-bar-group">
          <label>Personel ve servis:</label>
          <div class="bar-container">
            <div class="bar" :style="{ width: (avgRating.serviceRating * 10) + '%' }"></div>
          </div>
          <span>{{ avgRating.serviceRating }}/10</span>
        </div>
        <div class="rating-bar-group">
          <label>İmkan ve özellikler:</label>
          <div class="bar-container">
            <div class="bar" :style="{ width: (avgRating.amenitiesRating * 10) + '%' }"></div>
          </div>
          <span>{{ avgRating.amenitiesRating }}/10</span>
        </div>
        <div class="rating-bar-group">
          <label>Konaklama yerinin durumu, imkanları ve kolaylıkları:</label>
          <div class="bar-container">
            <div class="bar" :style="{ width: (avgRating.conditionRating * 10) + '%' }"></div>
          </div>
          <span>{{ avgRating.conditionRating }}/10</span>
        </div>
        <div class="rating-bar-group">
          <label>Çevre dostluğu:</label>
          <div class="bar-container">
            <div class="bar" :style="{ width: (avgRating.environmentRating * 10) + '%' }"></div>
          </div>
          <span>{{ avgRating.environmentRating }}/10</span>
        </div>
      </div>

      <div class="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-card">
          <p class="comment-rating">{{ comment.rating.toFixed(1) }}/10 {{ getRatingText(comment.rating) }}</p>
          <p class="comment-date">{{ formatDate(comment.createdAt) }}</p>
          <p class="comment-user">{{ comment.user.firstName }}, {{ comment.tripType }} seyahat</p>
          <p class="comment-text">{{ comment.comment }}</p>
          <p v-if="comment.reply" class="comment-reply">
            <small>{{ comment.replyBy }}, {{ formatDate(comment.replyDate) }} tarihinde gönderilen yanıt:</small><br>
            {{ comment.reply }}
          </p>
        </div>
        <p v-if="comments.length === 0">Bu otel için henüz yorum bulunmamaktadır.</p>
      </div>
    </section>

    <section class="hotel-map-section">
      <h2>Haritada Konum</h2>
      <div id="map-container" style="height: 250px; width: 100%; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin-bottom: 10px;">
        <iframe
          v-if="hotel && hotel.latitude && hotel.longitude"
          :src="getMapEmbedUrl"
          width="100%"
          height="100%"
          frameborder="0"
          style="border:0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <div v-else style="display: flex; justify-content: center; align-items: center; height: 100%; color: #777;">
          Harita bilgisi yüklenemedi.
        </div>
      </div>
      <p class="hotel-address-map">{{ hotel.address }}, {{ hotel.city }}, {{ hotel.country }}</p>
      <button @click="openInteractiveMapLink" class="map-link-button">Haritada göster</button>
    </section>
  </div>
  <div v-else class="loading-state">
    <p>Otel bilgileri yükleniyor...</p>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios'; 
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'HotelDetail',
  props: ['id'], // Route params'tan gelen otel ID'si
  data() {
    return {
      hotel: null,
      comments: [],
      loading: true,
      error: null
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'userName']),
    avgRating() {
      if (this.comments.length === 0) {
        return {
          cleanlinessRating: 0,
          serviceRating: 0,
          amenitiesRating: 0,
          conditionRating: 0,
          environmentRating: 0,
        };
      }
      const sum = (arr, prop) => arr.reduce((acc, curr) => acc + (parseFloat(curr[prop]) || 0), 0);
      const count = this.comments.filter(c => c.cleanlinessRating !== undefined).length;

      return {
        cleanlinessRating: (sum(this.comments, 'cleanlinessRating') / count).toFixed(1),
        serviceRating: (sum(this.comments, 'serviceRating') / count).toFixed(1),
        amenitiesRating: (sum(this.comments, 'amenitiesRating') / count).toFixed(1),
        conditionRating: (sum(this.comments, 'conditionRating') / count).toFixed(1),
        environmentRating: (sum(this.comments, 'environmentRating') / count).toFixed(1),
      };
    },
    // Harita iframe'i için URL oluşturan computed property
    getMapEmbedUrl() {
      if (this.hotel && this.hotel.latitude && this.hotel.longitude) {
        // Google Haritalar embed URL'i
        // 'q' parametresi ile enlem, boylam ve isteğe bağlı olarak otel adı verilebilir.
        // 'z' zoom seviyesidir.
        return `https://maps.google.com/maps?q=${this.hotel.latitude},${this.hotel.longitude}&z=15&output=embed`;
      }
      return ''; // Konum bilgisi yoksa boş döner
    }
  },
  async created() {
    await this.fetchHotelDetails();
  },
  methods: {
  ...mapActions(['logout']),
    async fetchHotelDetails() {
      this.loading = true;
      this.error = null;
      try {
        // Gerçek API'den otel bilgilerini ve yorumları çekiyoruz
        const response = await axios.get(`http://localhost:3000/api/hotels/${this.id}`);

        this.hotel = {
          ...response.data.hotel,
          price: parseFloat(response.data.hotel.price),
          member_price: parseFloat(response.data.hotel.member_price),
          amenitiesArray: response.data.hotel.amenities ? response.data.hotel.amenities.split(',').map(s => s.trim()) : [],
          discountPercentage: parseFloat(response.data.hotel.discount_percentage),
          totalComments: response.data.comments.length,
          latitude: parseFloat(response.data.hotel.latitude), 
          longitude: parseFloat(response.data.hotel.longitude)
        };
        this.comments = response.data.comments;

        console.log('Otel Detayları ve Yorumlar:', this.hotel, this.comments);

      } catch (err) {
        this.error = 'Otel bilgileri yüklenirken bir hata oluştu.';
        console.error('Otel detayları yükleme hatası:', err);
      } finally {
        this.loading = false;
      }
    },
    getRatingText(rating) {
      if (rating >= 9) return 'Harika';
      if (rating >= 8) return 'Mükemmel';
      if (rating >= 7) return 'Çok İyi';
      if (rating >= 6) return 'İyi';
      return 'Ortalama';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Date(dateString).toLocaleDateString('tr-TR', options);
    },
    // Google Haritalar'ı etkileşimli olarak yeni bir sekmede açan metod
    // Bu metod hala kullanılabilir ve herhangi bir API anahtarı veya ödeme gerektirmez.
    openInteractiveMapLink() {
      if (this.hotel && this.hotel.latitude && this.hotel.longitude) {
        // Enlem ve boylam ile Google Haritalar'ı aç (daha kesin)
        window.open(`https://www.google.com/maps/search/?api=1&query=${this.hotel.latitude},${this.hotel.longitude}`, '_blank');
      } else if (this.hotel && this.hotel.address) {
        // Adres ile Google Haritalar'ı aç (eğer enlem/boylam yoksa)
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.hotel.address + ', ' + this.hotel.city + ', ' + this.hotel.country)}`, '_blank');
      } else {
        alert('Haritada gösterilecek konum bilgisi bulunamadı.');
      }
    },
     // YENİ METOD: Login sayfasına yönlendirme
    navigateToLogin() {
      this.$router.push('/login');
    },
    // YENİ METOD: Çıkış yapma
    async handleLogout() {
      await this.logout(); // Vuex logout action'ını çağır
      this.$router.push('/login'); 
    }
  }
};
</script>

<style scoped>
/* ... mevcut stilleriniz ... */

.user-info {
  /* user-info için de flex ekleyelim ki butonlar yan yana gelsin */
  display: flex;
  align-items: center;
}

.user-info .welcome-message {
  font-weight: bold;
  margin-right: 1rem;
}

.login-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.logout-button {
  background-color: #dc3545; /* Kırmızı renk */
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px; /* Giriş yap/Hoş geldiniz mesajından biraz boşluk */
}

.logout-button:hover {
  background-color: #c82333;
}

/* ... diğer stilleriniz ... */
/* Yukarıda verdiğiniz tüm <style scoped> içeriğini buraya yapıştırın. */
.hotel-detail-page {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.logo {
  font-size: 2em;
  font-weight: bold;
  color: #333;
}

.com-text {
  color: #007bff;
}

.auth-links .login-button {
  background-color: #007bff;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  text-decoration: none;
}

.user-info span {
  font-weight: bold;
  color: #333;
}

.hotel-hero {
  text-align: center;
  margin-bottom: 30px;
}

.hotel-main-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

.hotel-hero h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
  color: #333;
}

.hotel-address {
  font-size: 1.1em;
  color: #777;
  margin-bottom: 15px;
}

.overall-rating {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 1.2em;
}

.rating-score {
  background-color: #007bff;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
}

.rating-text {
  font-weight: bold;
  color: #007bff;
}

.comment-count {
  color: #555;
}

.hotel-details-section,
.comments-section,
.hotel-map-section {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

h3 {
    color: #555;
    margin-top: 20px;
    margin-bottom: 15px;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.amenity-tag {
  background-color: #e9ecef;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9em;
  color: #555;
  display: flex;
  align-items: center;
}

.amenity-tag .icon {
    /* İkonlar için placeholder */
    margin-right: 5px;
    font-size: 1.1em;
}

.price-info {
    text-align: right;
    margin-top: 20px;
}

.current-price {
    font-size: 2em;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
}

.current-price small {
    font-size: 0.6em;
    font-weight: normal;
    color: #777;
}

.discounted-price {
    color: red;
    font-weight: bold;
    font-size: 1.2em;
    margin-bottom: 5px;
}

.original-price-strikethrough {
    text-decoration: line-through;
    color: #777;
    margin-right: 10px;
}

.discount-badge {
    background-color: red;
    color: white;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 0.8em;
}

.member-price-cta {
    color: #ffc107; /* Sarı renk */
    font-weight: bold;
    font-size: 0.9em;
    margin-top: 5px;
}
.member-price-display {
    color: #007bff; /* Mavi renk */
    font-weight: bold;
    font-size: 1.2em;
    margin-top: 5px;
}


.book-now-button {
  background-color: #28a745;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  font-size: 1.2em;
  cursor: pointer;
  display: block;
  width: fit-content;
  margin: 20px auto 0;
}

.book-now-button:hover {
  background-color: #218838;
}

.rating-breakdown {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.rating-bar-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.rating-bar-group label {
  flex: 2;
  font-weight: bold;
  color: #555;
}

.rating-bar-group .bar-container {
  flex: 5;
  background-color: #e0e0e0;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  margin-right: 10px;
}

.rating-bar-group .bar {
  height: 100%;
  background-color: #007bff;
  border-radius: 5px;
}

.rating-bar-group span {
  flex: 1;
  text-align: right;
  font-weight: bold;
  color: #333;
}

.comment-list {
  margin-top: 20px;
}

.comment-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.comment-rating {
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
}

.comment-date, .comment-user {
  font-size: 0.85em;
  color: #777;
  margin-bottom: 5px;
}

.comment-text {
  margin-top: 10px;
  color: #333;
}

.comment-reply {
    background-color: #f0f8ff;
    border-left: 3px solid #007bff;
    padding: 10px;
    margin-top: 10px;
    font-size: 0.9em;
    color: #444;
}

#map-container {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.hotel-address-map {
    text-align: center;
    margin-top: 15px;
    font-size: 1.1em;
    color: #555;
}

.map-link-button {
    background-color: #6c757d;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: block;
    width: fit-content;
    margin: 15px auto 0;
}

.map-link-button:hover {
    background-color: #5a6268;
}

.loading-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2em;
  color: #666;
}

.error-message {
  color: red;
  margin-top: 10px;
}

/* Responsive Tasarım */
@media (max-width: 768px) {
  .hotel-hero h1 {
    font-size: 1.8em;
  }
  .overall-rating {
    flex-direction: column;
    gap: 5px;
  }
  .rating-bar-group {
    flex-direction: column;
    align-items: flex-start;
  }
  .rating-bar-group label {
    width: 100%;
    margin-bottom: 5px;
  }
  .rating-bar-group .bar-container {
    width: 100%;
    margin-right: 0;
  }
  .rating-bar-group span {
    width: 100%;
    text-align: left;
    margin-top: 5px;
  }
  .amenities-list {
    justify-content: center;
  }
}
</style>