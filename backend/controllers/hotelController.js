// backend/controllers/hotelController.js
const pool = require('../db'); // Veritabanı bağlantısını içeri aktarıyoruz

// Otelleri Listeleme İşlevi
exports.getAllHotels = async (req, res) => {
  try {
    const { city, orderBy } = req.query;

    let query = 'SELECT * FROM hotels';
    const queryParams = [];
    let whereClause = '';

    if (city) {
      whereClause += ' WHERE city ILIKE $1';
      queryParams.push(`%${city}%`);
    }

    if (orderBy === 'points') {
      query += ` ${whereClause.trim() ? whereClause : ''} ORDER BY points DESC`;
    } else {
      query += ` ${whereClause.trim() ? whereClause : ''} ORDER BY points DESC`;
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Otel listesi çekilirken hata oluştu:', err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// Tek bir otelin detaylarını ve yorumlarını ID'ye göre getirme İşlevi
exports.getHotelById = async (req, res) => {
  const { id } = req.params;

  try {
    const hotelResult = await pool.query('SELECT * FROM hotels WHERE id = $1', [id]);

    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ message: 'Otel bulunamadı.' });
    }

    const hotel = hotelResult.rows[0];

    const commentsResult = await pool.query(
      `SELECT
          id, hotel_id, rating, comment, cleanliness_rating, service_rating,
          amenities_rating, condition_rating, environment_rating, created_at,
          user_first_name as "user.firstName",
          trip_type as "tripType",
          reply, reply_by as "replyBy", reply_date as "replyDate"
        FROM comments
        WHERE hotel_id = $1
        ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      hotel: {
        ...hotel,
        rating: parseFloat(hotel.rating),
        price: parseFloat(hotel.price),
        member_price: parseFloat(hotel.member_price),
        amenitiesArray: hotel.amenities ? hotel.amenities.split(',') : [],
      },
      comments: commentsResult.rows.map(comment => ({
        ...comment,
        user: { firstName: comment["user.firstName"] },
        rating: parseFloat(comment.rating),
        cleanlinessRating: parseFloat(comment.cleanliness_rating),
        serviceRating: parseFloat(comment.service_rating),
        amenitiesRating: parseFloat(comment.amenities_rating),
        conditionRating: parseFloat(comment.condition_rating),
        environmentRating: parseFloat(comment.environment_rating),
      }))
    });

  } catch (error) {
    console.error('Otel detayları ve yorumları çekilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};