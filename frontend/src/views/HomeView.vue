<template>
  <div id="home-view">
    <header class="header">
      <div class="logo">Hotels.<span class="com-text">com</span></div>
      <div class="user-info">
        <span v-if="isAuthenticated" class="welcome-message"
          >Merhaba, {{ userName }}</span
        >
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

    <section class="search-section">
      <div class="search-inputs">
        <div class="search-item">
          <label for="city">Nereye?</label>
          <input
            type="text"
            id="city"
            v-model="searchParams.city"
            placeholder="Varış noktası"
          />
        </div>
        <div class="search-item">
          <label>Tarihler</label>
          <span
            >{{ searchParams.checkInDate }} -
            {{ searchParams.checkOutDate }}</span
          >
        </div>
        <div class="search-item">
          <label>Misafir sayısı</label>
          <span
            >{{ searchParams.guestCount }} misafir,
            {{ searchParams.roomCount }} oda</span
          >
        </div>
        <button @click="searchHotels" class="search-button">Ara</button>
      </div>
      <p class="info-text">300 veya daha fazla konaklama yeri</p>
      <p class="info-text">Konaklama yeri sıralamamızın işleyiş şekli</p>
    </section>

    <section class="hotel-list-section">
      <div class="list-header">
        <h3>Konaklama Yerleri</h3>
        <div class="sort-options">
          <span>Sıralama ölçütü: Önerilen</span>
        </div>
        <button @click="showAllHotelsOnMap" class="map-button">Haritada göster</button>
      </div>

      <div class="hotel-cards-container">
        <div v-if="hotels.length === 0" class="no-hotels-message">
          Oteller yükleniyor...
        </div>
        <div v-for="hotel in hotels" :key="hotel.id" class="hotel-card">
          <img :src="hotel.image_url" :alt="hotel.name" class="hotel-image" />
          <div class="hotel-details">
            <h4 class="hotel-name">{{ hotel.name }}</h4>
            <p class="hotel-address">{{ hotel.address }}</p>
            <div class="hotel-amenities">
              <span
                v-for="(amenity, index) in hotel.amenities"
                :key="index"
                class="amenity-tag"
              >
                {{ amenity.trim() }}
              </span>
            </div>
            <div class="hotel-rating">
              <span class="rating-score">{{ hotel.rating }}</span>
              <span class="rating-text">Mükemmel</span>
              <span class="review-count">({{ hotel.review_count }} yorum)</span>
            </div>
            <div class="hotel-price-info">
              <p class="original-price" v-if="hotel.discount_percentage > 0">
                {{ hotel.price.toFixed(2) }} TL
              </p>
              <p class="current-price">
                {{
                  (hotel.price * (1 - hotel.discount_percentage / 100)).toFixed(
                    2
                  )
                }}
                TL
              </p>
              <p class="price-note">Toda için vergiler ve ücretler dahildir</p>
              <p
                class="discount-percentage"
                v-if="hotel.discount_percentage > 0"
              >
                %{{ hotel.discount_percentage }} indirim
              </p>
            </div>
            <div class="member-price-info">
              <p v-if="!isAuthenticated" class="member-login-cta">
                Üye fiyatı için giriş yapın
              </p>
              <p v-else class="member-price-display">
                Üye Fiyatı: {{ hotel.member_price.toFixed(2) }} TL
              </p>
            </div>
            <button @click="viewHotelDetails(hotel.id)" class="details-button">
              Detayları Gör
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="search-by-name-section">
      <h4>Konaklama yeri adına göre ara</h4>
      <input type="text" placeholder="Konaklama yeri adı" />
      <button @click="searchByName">Ara</button>
    </section>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex"; // mapGetters ve mapActions import et

// Diğer importlarınız (components, etc.)

export default {
  name: "HomeView",
  // components: { /* Eğer varsa */ },
  data() {
    return {
      // isLoggedIn ve firstName artık doğrudan Vuex getters'ından alınacak
      searchParams: {
        city: "Marmaris", // Varsayılan değer
        checkInDate: this.formatDate(new Date()),
        checkOutDate: this.formatDate(
          new Date(new Date().setDate(new Date().getDate() + 1))
        ),
        guestCount: 2,
        roomCount: 1,
      },
      hotels: [], // Artık boş bir dizi, backend'den gelecek
      // Diğer data özellikleri...
    };
  },
  computed: {
    // Vuex getters'larını doğrudan computed property'lere bağla
    ...mapGetters(["isAuthenticated", "userName", "user"]), // isAuthenticated ve userName getter'larını ekledik
    // Bu sayede template'te doğrudan 'isAuthenticated' ve 'userName' kullanabiliriz.
  },
  // watch ve created hook'undaki manuel atamaları kaldırdık,
  // çünkü computed property'ler otomatik olarak güncellenecek.
  created() {
    this.fetchHotels(); // Otelleri çekme işlemini çağır
  },
  // frontend/src/views/HomeView.vue içindeki methods objesi içinde
  methods: {
    // Vuex actions'larını bağla
    ...mapActions(["logout"]), // logout action'ını ekle

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${day}.${month}.${year}`;
    },
    async fetchHotels(city = "") {
      try {
        let url = `http://localhost:3000/api/hotels`;
        if (city) {
          url += `?city=${encodeURIComponent(city)}`;
        }

        const response = await axios.get(url);
        this.hotels = response.data.map((hotel) => ({
          ...hotel,
          // Price ve member_price değerlerini sayıya dönüştür
          price: parseFloat(hotel.price),
          member_price: parseFloat(hotel.member_price),
          // Olanaklar string olarak geliyorsa diziye çevir
          amenities: hotel.amenities ? hotel.amenities.split(",") : [],
        }));
        console.log("Oteller başarıyla çekildi:", this.hotels);
      } catch (error) {
        console.error("Oteller çekilirken hata oluştu:", error);
        // Hata durumunda kullanıcıya bilgi verebiliriz
      }
    },
    searchHotels() {
      console.log("Otel Ara tıklandı!", this.searchParams.city);
      this.fetchHotels(this.searchParams.city); // Arama butonunda şehri gönder
    },
    navigateToLogin() {
      this.$router.push("/login");
    },
    viewHotelDetails(hotelId) {
      this.$router.push(`/hotel/${hotelId}`);
    },
    showAllHotelsOnMap() {
      if (this.searchParams.city) {
        // maps_local.Google Maps aracı ile Google Haritalar URL'sini alalım
        const query = encodeURIComponent(this.searchParams.city + ", Türkiye");
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        window.open(mapUrl, '_blank'); // Yeni sekmede aç
      } else {
        alert("Haritada göstermek için bir şehir seçmelisiniz.");
      }
    },
    searchByName() {
      // Ada göre arama özelliği daha sonra yapılacak
      alert("Konaklama yeri adına göre arama özelliği henüz entegre edilmedi.");
    },
    // YENİ METOD: Çıkış yapma
    async handleLogout() {
      await this.logout(); // Vuex logout action'ını çağır
      this.$router.push("/login"); // Kullanıcıyı login sayfasına yönlendir
    },
  },
};
</script>

<style scoped>
/* Mevcut stil kodlarınız aynı kalabilir */
/* Sadece logout-button için yeni bir stil ekleyebilirsiniz */
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
/* Diğer stil kuralları yukarıdaki gibidir */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.logo {
  font-size: 2em;
  font-weight: bold;
  color: #333;
}
.com-text {
  color: #007bff;
}


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

.search-section {
  background-color: #003580; /* Booking.com blue */
  padding: 2rem;
  color: white;
  text-align: center;
}

.search-inputs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.search-item {
  background-color: white;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-item label {
  font-weight: bold;
}

.search-item input {
  border: none;
  outline: none;
  padding: 0.2rem;
}

.search-item span {
  color: #555;
}

.search-button {
  background-color: #007bff; /* Primary button color */
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
}

.info-text {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.hotel-list-section {
  padding: 2rem;
  background-color: #f2f2f2;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.list-header h3 {
  margin: 0;
}

.sort-options span {
  font-size: 0.9rem;
  color: #555;
}

.map-button {
  background-color: #6c757d; /* Grey button */
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.hotel-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.hotel-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.hotel-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.hotel-details {
  padding: 1rem;
  flex-grow: 1; /* Allows details section to expand */
}

.hotel-name {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #007bff;
}

.hotel-address {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.hotel-amenities {
  margin-bottom: 0.5rem;
}

.amenity-tag {
  display: inline-block;
  background-color: #e9ecef;
  color: #333;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.hotel-rating {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.rating-score {
  background-color: #00aa6c; /* Green for good rating */
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-weight: bold;
  margin-right: 0.5rem;
}

.rating-text {
  font-weight: bold;
  color: #333;
  margin-right: 0.5rem;
}

.review-count {
  font-size: 0.85rem;
  color: #777;
}

.hotel-price-info {
  margin-bottom: 1rem;
}

.original-price {
  text-decoration: line-through;
  color: #777;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}

.current-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 0.2rem;
}

.price-note {
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 0.5rem;
}

.discount-percentage {
  background-color: #dc3545; /* Red for discount */
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: bold;
}

.member-price-info {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.member-login-cta {
  font-size: 0.9rem;
  color: #007bff;
  font-weight: bold;
}

.member-price-display {
  font-size: 1rem;
  font-weight: bold;
  color: #28a745; /* Green for member price */
}

.details-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
}

.search-by-name-section {
  padding: 2rem;
  background-color: #eee;
  text-align: center;
  border-top: 1px solid #ddd;
}

.search-by-name-section h4 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.search-by-name-section input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 0.5rem;
  width: 250px;
}

.search-by-name-section button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.no-hotels-message {
  grid-column: 1 / -1; /* Spans all columns */
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #555;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ccc;
}
</style>
