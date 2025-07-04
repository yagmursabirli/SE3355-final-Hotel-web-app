// backend/controllers/hotelController.js
const pool = require('../db'); // Veritabanı bağlantısını içeri aktarıyoruz

// Otelleri Listeleme İşlevi
exports.getAllHotels = async (req, res) => {
   console.log("getAllHotels isteği alındı.");
  console.log("Query Parametreleri:", req.query); 
  try {
    const { city, name, guestCount, roomCount, orderBy, checkInDate, checkOutDate } = req.query;

    let query = `
      SELECT
          id, name, address, image_url, amenities, rating,
          review_count, price, discount_percentage, member_price,
          latitude, longitude, points, unavailable_dates
      FROM
          hotels
      `;
    const queryParams = [];
    let whereClauses = []; 
    let paramIndex = 1; 

    if (city) {
      whereClauses.push(`city ILIKE $${paramIndex}`);
      queryParams.push(`%${city}%`);
      paramIndex++;
    }

    if (name) { 
      whereClauses.push(`name ILIKE $${paramIndex}`);
      queryParams.push(`%${name}%`);
      paramIndex++;
    }
   
    if (guestCount) {
      whereClauses.push(`max_guests >= $${paramIndex}`);
      queryParams.push(parseInt(guestCount));
      paramIndex++;
    }
    if (roomCount) {
      whereClauses.push(`available_rooms >= $${paramIndex}`); 
      queryParams.push(parseInt(roomCount));
      paramIndex++;
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`; 
    }

     switch (orderBy) {
      case 'rating_desc':
        query += ` ORDER BY rating DESC`; // Puana göre azalan
        break;
      case 'rating_asc':
        query += ` ORDER BY rating ASC`;   // Puana göre artan
        break;
      case 'price_asc':
        query += ` ORDER BY price ASC`;    // Fiyata göre artan
        break;
      case 'price_desc':
        query += ` ORDER BY price DESC`;   // Fiyata göre azalan
        break;
      case 'recommended': // Varsayılan olarak "önerilen"
      default:
        query += ` ORDER BY rating DESC`; 
        break;
    }
    console.log("Backend SQL Sorgusu:", query); 
    console.log("Backend Sorgu Parametreleri:", queryParams);

    const result = await pool.query(query, queryParams);
    const parsedCheckInDate = checkInDate ? new Date(checkInDate) : null;
    const parsedCheckOutDate = checkOutDate ? new Date(checkOutDate) : null;

     const hotelsWithAvailability = result.rows.map(hotel => {
      let isAvailable = true; // Varsayılan olarak otel müsait
      let availabilityStatus = 'Müsait';


      
      if (parsedCheckInDate && parsedCheckOutDate) {
        if (hotel.unavailable_dates && Array.isArray(hotel.unavailable_dates)) {
          for (const range of hotel.unavailable_dates) {
            const unavailableStart = new Date(range.start);
            const unavailableEnd = new Date(range.end);

          
            if (parsedCheckInDate < unavailableEnd && parsedCheckOutDate > unavailableStart) {
              isAvailable = false; // Çakışma var, otel müsait değil
              availabilityStatus = 'Seçilen tarihlerde uygun oda yok❗';
              break; 
            }
          }
        }
      }

      // Frontend'e gönderilecek otel nesnesi
      return {
        ...hotel,
        is_available: isAvailable, 
        availability_status: availabilityStatus,
        rating: parseFloat(hotel.rating),
        price: parseFloat(hotel.price),
        member_price: parseFloat(hotel.member_price),
        amenities: hotel.amenities ? hotel.amenities.split(',').map(s => s.trim()) : [],
      };
    });

    res.json(hotelsWithAvailability);
  } catch (err) {
    console.error('Otel listesi çekilirken hata oluştu:', err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

exports.getHotelById = async (req, res) => {
  const { id } = req.params;

  try {
    const hotelResult = await pool.query('SELECT *, latitude, longitude FROM hotels WHERE id = $1', [id]);


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