// backend/routes/hotels.js
const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController'); // Controller'ı içeri aktarıyoruz

// Tüm otelleri getirme rotası (örn: GET /api/hotels)
router.get('/', hotelController.getAllHotels);

// Tek bir otelin detaylarını ve yorumlarını ID'ye göre getirme rotası (örn: GET /api/hotels/123)
router.get('/:id', hotelController.getHotelById);

module.exports = router; // Router'ı dışa aktarıyoruz