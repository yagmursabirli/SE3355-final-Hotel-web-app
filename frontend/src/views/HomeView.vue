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
        <div class="search-item date-picker-container">
          <label>Tarihler</label>
          <Datepicker
            v-model="dateRange"
            range
            :enable-time-picker="false"
            :format="customDateFormatter"
            placeholder="Tarihleri Seçin"
            locale="tr"
            :min-date="new Date()"
            @update:model-value="handleDateRangeUpdate"
            input-class-name="datepicker-input"
          ></Datepicker>
        </div>
        <div class="search-item">
          <label for="guest-count">Misafir sayısı</label>
          <input
            type="number"
            id="guest-count"
            v-model.number="searchParams.guestCount"
            min="1"
            max="10"
            class="number-input"
          />
        </div>
        <div class="search-item">
          <label for="room-count">Oda sayısı</label>
          <input
            type="number"
            id="room-count"
            v-model.number="searchParams.roomCount"
            min="1"
            max="10"
            class="number-input"
          />
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
          <label for="sort-by">Sıralama ölçütü:</label>
          <select id="sort-by" v-model="sortOrder" @change="applySorting">
            <option value="recommended">Önerilen</option>
            <option value="rating_desc">Puan (Yüksekten Düşüğe)</option>
            <option value="rating_asc">Puan (Düşükten Yükseğe)</option>
            <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
            <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
          </select>
        </div>
        <button @click="showAllHotelsOnMap" class="map-button">
          Haritada göster
        </button>
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

            <p
              :class="{
                'availability-status': true,
                'status-available':
                  hotel.is_available ,
                'status-unavailable':
                  !hotel.is_available,
              }"
            >
              {{ hotel.availability_status }}
              <span
                v-if="hotel.is_available && hotel.available_rooms_for_dates > 0"
                >({{ hotel.available_rooms_for_dates }} oda müsait)</span
              >
            </p>
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
              <span class="rating-text">{{ getRatingText(hotel.rating) }}</span>
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
              <p class="price-note">Oda için vergiler ve ücretler dahildir</p>
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
            <button
              @click="viewHotelDetails(hotel.id)"
              class="details-button"
              :disabled="!hotel.is_available"
            >
              Detayları Gör
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="search-by-name-section">
      <h4>Konaklama yeri adına göre ara</h4>
      <input type="text" placeholder="Konaklama yeri adı" v-model="hotelName" />
      <button @click="searchByName">Ara</button>
    </section>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";
import Datepicker from "@vuepic/vue-datepicker"; 
import "@vuepic/vue-datepicker/dist/main.css"; 

export default {
  name: "HomeView",
  components: {
    Datepicker, 
  },
  data() {
    return {
      searchParams: {
        city: null, 
        checkInDate: null,
        checkOutDate: null,
        guestCount: 2,
        roomCount: 1,
      },
      hotels: [],
      hotelName: "",
      dateRange: [null, null], 
      sortOrder: "recommended",
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "userName", "user"]),
  },
  created() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.dateRange = [today, tomorrow]; 
    this.searchParams.checkInDate = today; 
    this.searchParams.checkOutDate = tomorrow; 
    this.fetchHotels(this.searchParams.city, "", this.sortOrder);
  },
  methods: {
    ...mapActions(["logout"]),
    customDateFormatter(date) {
      if (Array.isArray(date)) {
        if (date[0] && date[1]) {
          const d1 = new Date(date[0]);
          const d2 = new Date(date[1]);
          const day1 = String(d1.getDate()).padStart(2, "0");
          const month1 = String(d1.getMonth() + 1).padStart(2, "0");
          const year1 = d1.getFullYear();
          const day2 = String(d2.getDate()).padStart(2, "0");
          const month2 = String(d2.getMonth() + 1).padStart(2, "0");
          const year2 = d2.getFullYear();
          return `${day1}.${month1}.${year1} - ${day2}.${month2}.${year2}`;
        }
        return "Tarihleri Seçin"; 
      } else if (date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
      }
      return "";
    },

    handleDateRangeUpdate(newDates) {
      if (newDates && newDates.length === 2) {
        this.searchParams.checkInDate = newDates[0];
        this.searchParams.checkOutDate = newDates[1];
      } else {
        this.searchParams.checkInDate = null;
        this.searchParams.checkOutDate = null;
      }
      console.log(
        "Seçilen Tarih Aralığı:",
        this.searchParams.checkInDate,
        "-",
        this.searchParams.checkOutDate
      );
      // Tarih değiştiğinde otelleri yeniden çek
      this.fetchHotels(this.searchParams.city, this.hotelName, this.sortOrder);
    },
    getRatingText(rating) {
      if (rating >= 9) {
        return "Mükemmel";
      } else if (rating >= 8) {
        return "Çok İyi";
      } else if (rating >= 7) {
        return "İyi";
      } else if (rating >= 6) {
        return "Ortalama";
      } else {
        return "Kötü"; 
      }
    },

    applySorting() {
      this.fetchHotels(this.searchParams.city, this.hotelName, this.sortOrder);
    },
    async fetchHotels(city = "", hotelName = "", sort = "recommended") {
      try {
        let url = `/api/hotels`;
        const queryParams = [];

        if (city) {
          queryParams.push(`city=${encodeURIComponent(city)}`);
        }
        if (hotelName) {
          queryParams.push(`name=${encodeURIComponent(hotelName)}`);
        }
        if (this.searchParams.checkInDate) {
          queryParams.push(
            `checkInDate=${this.searchParams.checkInDate.toISOString()}`
          );
        }
        if (this.searchParams.checkOutDate) {
          queryParams.push(
            `checkOutDate=${this.searchParams.checkOutDate.toISOString()}`
          );
        }
        if (this.searchParams.guestCount) {
          queryParams.push(`guestCount=${this.searchParams.guestCount}`);
        }
        if (this.searchParams.roomCount) {
          queryParams.push(`roomCount=${this.searchParams.roomCount}`);
        }
        if (sort && sort !== "recommended") {
          queryParams.push(`orderBy=${encodeURIComponent(sort)}`);
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`;
        }
        console.log("Gönderilen API URL'si (fetchHotels):", url);
        const response = await axios.get(url);
        console.log("API'den gelen ham veri (fetchHotels):", response.data);
        this.hotels = response.data.map((hotel) => ({
          ...hotel,
          price: parseFloat(hotel.price),
          member_price: parseFloat(hotel.member_price),
          rating: parseFloat(hotel.rating), // Rating'i de parseFloat yap
        }));
        console.log("Oteller başarıyla çekildi:", this.hotels);
      } catch (error) {
        console.error("Oteller çekilirken hata oluştu:", error);
      }
    },
    searchHotels() {
      console.log("Şehir Ara butonu tıklandı! Şehir:", this.searchParams.city);
      this.fetchHotels(this.searchParams.city, "");
    },
    navigateToLogin() {
      this.$router.push("/login");
    },
    viewHotelDetails(hotelId) {
      this.$router.push(`/hotel/${hotelId}`);
    },
    showAllHotelsOnMap() {
      if (this.searchParams.city && !this.hotelName) {
        const query = encodeURIComponent(this.searchParams.city + ", Türkiye");
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        window.open(mapUrl, "_blank");
      }
      else if (
        this.hotelName &&
        this.hotels.length === 1 &&
        this.hotels[0].latitude &&
        this.hotels[0].longitude
      ) {
        const hotel = this.hotels[0];
        const lat = parseFloat(hotel.latitude); 
        const lng = parseFloat(hotel.longitude); 
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${
          hotel.place_id || ""
        }`;
        window.open(mapUrl, "_blank");
      }
      else if (
        this.hotelName &&
        (this.hotels.length === 0 ||
          this.hotels.length > 1 ||
          !this.hotels[0].latitude ||
          !this.hotels[0].longitude)
      ) {
        alert(
          "Aranan otele ait kesin konum bilgisi bulunamadı, birden fazla otel bulundu veya konum verisi eksik. Lütfen şehre göre arama yapmayı deneyin."
        );
      }
      else {
        alert(
          "Haritada göstermek için bir şehir veya otel araması yapmalısınız."
        );
      }
    },
    searchByName() {
      console.log("Otel adına göre ara tıklandı!", this.hotelName);
      this.fetchHotels("", this.hotelName);
    },
    async handleLogout() {
      await this.logout();
      this.$router.push("/login");
    },
  },
};
</script>
<style scoped>
.logout-button {
  background-color: #dc3545; 
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px; 
}
.logout-button:hover {
  background-color: #c82333;
}
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
  background-color: #003580; 
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
  flex-wrap: wrap; 
}

.search-item {
  background-color: white;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 30px;
}

.search-item label {
  font-weight: bold;
}

.datepicker-input {
  border: none;
  outline: none;
  padding: 0.2rem;
  width: 100px; 
  text-align: center;
}

.date-picker-container {
  display: flex;
  align-items: center;
  gap: 5px; 
}

.date-separator {
  color: #555;
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
  background-color: #007bff; 
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
  background-color: #6c757d;
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
  flex-grow: 1; 
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
  background-color: #00aa6c; 
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
  background-color: #dc3545; 
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
  color: #28a745; 
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
  grid-column: 1 / -1; 
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #555;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ccc;
}
.sort-options label {
  margin-right: 0.5rem;
  font-weight: bold;
  color: #333; /* Renk ayarlayabilirsiniz */
}

.sort-options select {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.sort-options select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
