<template>
  <div class="login-page">
    <div class="form-container">
      <h2>Giriş Yap</h2>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="loginEmail">E-posta</label>
          <input
            type="email"
            id="loginEmail"
            v-model="loginForm.email"
            required
          />
        </div>
        <div class="form-group">
          <label for="loginPassword">Şifre</label>
          <input
            type="password"
            id="loginPassword"
            v-model="loginForm.password"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary">Giriş Yap</button>
      </form>
      <button @click="loginWithGoogle" class="btn btn-secondary google-btn">
        Google ile Giriş Yap
      </button>
      <p v-if="message" :class="messageType">{{ message }}</p>
    </div>

    <div class="form-container register-container">
      <h2>Kayıt Ol</h2>
      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <label for="regFirstName">Adınız</label>
          <input
            type="text"
            id="regFirstName"
            v-model="registerForm.firstName"
            required
          />
        </div>
        <div class="form-group">
          <label for="regLastName">Soyadınız</label>
          <input
            type="text"
            id="regLastName"
            v-model="registerForm.lastName"
            required
          />
        </div>
        <div class="form-group">
          <label for="regEmail">E-posta</label>
          <input
            type="email"
            id="regEmail"
            v-model="registerForm.email"
            required
          />
        </div>
        <div class="form-group">
          <label for="regPassword">Şifre</label>
          <input
            type="password"
            id="regPassword"
            v-model="registerForm.password"
            required
          />
        </div>
        <div class="form-group">
          <label for="regPasswordConfirm">Şifre Tekrar</label>
          <input
            type="password"
            id="regPasswordConfirm"
            v-model="registerForm.passwordConfirm"
            required
          />
        </div>
        <div class="form-group">
          <label for="regCountry">Ülke</label>
          <select id="regCountry" v-model="registerForm.country" required>
            <option value="">Ülke Seçin</option>
            <option value="Türkiye">Türkiye</option>
            <option value="ABD">ABD</option>
            <option value="Almanya">Almanya</option>
          </select>
        </div>
        <div class="form-group">
          <label for="regCity">Şehir</label>
          <select id="regCity" v-model="registerForm.city" required>
            <option value="">Şehir Seçin</option>
            <option value="Izmir">İzmir</option>
            <option value="Istanbul">İstanbul</option>
            <option value="Ankara">Ankara</option>
          </select>
        </div>
        <button type="submit" class="btn btn-success">Kayıt Ol</button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "LoginPage",
  data() {
    return {
      loginForm: {
        email: "",
        password: "",
      },
      registerForm: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm: "",
        country: "Türkiye", // Varsayılan değer
        city: "Izmir", // Varsayılan değer
      },
      message: "",
      messageType: "",
    };
  },
  methods: {
    ...mapActions(["loginUser", "registerUser"]),

    async login() {
      try {
        await this.loginUser(this.loginForm);
        this.message = "Giriş başarılı!";
        this.messageType = "success";
        this.$router.push("/");
      } catch (error) {
        this.message =
          error.response?.data?.message ||
          "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
        this.messageType = "error";
      }
    },
    // handleProfilePictureUpload metodu artık çağrılmayacak veya kaldırılabilir
    handleProfilePictureUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.registerForm.profilePicture = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.profilePicturePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.registerForm.profilePicture = null;
        this.profilePicturePreview = null;
      }
    },
    async register() {
      if (this.registerForm.password !== this.registerForm.passwordConfirm) {
        this.message = "Şifreler eşleşmiyor!";
        this.messageType = "error";
        return;
      }

      const passwordRegex =
        /^(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]\\|:;"'<>,.?/~`]).{8,}$/;
      if (!passwordRegex.test(this.registerForm.password)) {
        this.message =
          "Şifre en az 8 karakter, 1 sayı ve 1 alfasayısal olmayan karakter içermeli.";
        this.messageType = "error";
        return;
      }

      try {
        // *** BURADA DEĞİŞİKLİK YAPIYORUZ: Doğrudan registerForm objesini JSON olarak gönderiyoruz ***
        const userData = {
          firstName: this.registerForm.firstName,
          lastName: this.registerForm.lastName,
          email: this.registerForm.email,
          password: this.registerForm.password,
          country: this.registerForm.country,
          city: this.registerForm.city,
          // profilePicture: this.registerForm.profilePicture, // Profil resmi artık gönderilmiyor
        };

        // Axios, varsayılan olarak JavaScript objelerini JSON olarak gönderir
        await this.registerUser(userData); // Vuex action'ını çağır

        this.message = "Kayıt başarılı! Şimdi giriş yapabilirsiniz.";
        this.messageType = "success";
        // Formu sıfırla
        this.registerForm = {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          passwordConfirm: "",
          country: "Türkiye",
          city: "Izmir",
          profilePicture: null,
        };
        this.profilePicturePreview = null;
        // Giriş formunu doldur
        this.loginForm.email = this.registerForm.email;
        this.loginForm.password = "";
      } catch (error) {
        this.message = error.response?.data?.message || "Kayıt başarısız.";
        this.messageType = "error";
      }
    },
  },
};
</script>

<style scoped>
/* Mevcut stil kodlarınız aynı kalabilir */
.login-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px; /* Formlar arası boşluk */
  padding: 40px;
  min-height: calc(100vh - 60px); /* Navbar yüksekliğini çıkar */
  background-color: #f0f2f5;
  font-family: Arial, sans-serif;
}

.form-container {
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.form-container h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 1.8em;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: bold;
}

.form-group input[type="email"],
.form-group input[type="password"],
.form-group input[type="text"],
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1em;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #007bff;
  outline: none;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.google-btn {
  background-color: #dc3545; /* Kırmızımsı bir renk */
  margin-top: 20px;
}

.google-btn:hover {
  background-color: #c82333;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  text-align: center;
}

.success {
  color: #28a745;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  text-align: center;
}

.register-container {
  max-width: 450px; /* Kayıt formu biraz daha geniş olabilir */
}

/* Profil resmiyle ilgili stil kuralları da artık gereksiz olabilir */
.profile-picture-group {
  display: none; /* Şimdilik gizle */
}
</style>
