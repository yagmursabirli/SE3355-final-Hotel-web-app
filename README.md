# 🏨 Hotel Booking Web Application 

This project is a full-stack hotel booking web application built using Vue.js for frontend, Node.js + Express for backend, and PostgreSQL for database.
It allows users to search for hotels, view details and authenticate. Both traditional email/password and Google authentication are supported.


---

## ✨ Features

* **Flexible Authentication:**
    * Register and log in with email and password.
    * Quick and secure login using Google OAuth2.
    * JWT (JSON Web Token) for secure session management.
* **Hotel Discovery:**
    * Easily list and discover hotels on the homepage.
    * Sort hotels by rating and price.
    * Search by hotel or location name.
    * Choose dates, guest count and room count.
    * Show on map.
    * View detailed information for each hotel (images, description, amenities).
* **Security Focused:**
    * User passwords are hashed with `bcrypt`.
    * API requests are authenticated with JWT. Authorization checks are applied.
* **Responsive Design:** The application offers a smooth user experience on all devices (desktop, tablet, mobile).


---

## 🗂️ Tech Stack

- **Frontend**: Vue 3, Vuex, Vue Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token), bcrypt
- **Deployment**: Render (backend & frontend), PostgreSQL hosted on Render as well.

---

## 🏗️ Architectural Design & Separation of Concerns

This project was built with focus on Separation of Concerns (SoC) to keep everything clean and maintainable.
On the backend, I followed an MVC-inspired structure — separating routing, controller logic, and data models to keep responsibilities well-defined.
On the frontend, I used the MVVM pattern through Vue’s reactive system, which helped me manage the state and UI logic in a modular and efficient way.

## 🗄️ Data Model

The application's data is structured across several interconnected tables in a PostgreSQL database, designed to efficiently manage user, hotel, and comment information.

* **`users` Table:**
    * Stores user registration and profile details.
    * Includes fields like `id` (Primary Key), `first_name`, `last_name`, `email` (Unique), `password_hash` (for traditional logins),
    * `google_id` (for Google sign-ins, Unique), `country`, `city`, `profile_image_base64`, and `created_at`.
    * `email` and `google_id` fields ensure distinct user accounts.
* **`hotels` Table:**
    * Contains information about various hotels listed in the application.
    * fields: `hotel_id` (Primary Key), `name`, `description`, `address`, `city`, `country`, `rating`, `amenities`, `review_count`, `price`, `discount_percentage`, `member_price`,
    * `image_url', `description`, `points`, `latitude`, `longitude`, `max_guests`, `available_rooms`, `unavailable_dates`.
* **`comments` Table:**
    * Stores user comments or reviews related to hotels.
    * includes: `comment_id`, `user_id`, `hotel_id`, `comment`, `cleanliness_rating`, `service_rating`, `amenities_rating`, `condition_rating`, `environment_rating`, 
    *  `rating`, `created_at`, `user_first_name`, `trip_type`, `reply`, `reply_by`, `reply_date`.
 
## 🚧 Challenges Faced
* **Seamless Google OAuth Integration:** Integrating Google OAuth for user login was a significant challenge.
  **Frontend Static Site Hosting (404 Errors):** A major challenge involved ensuring the Vue.js Single Page Application (SPA) was correctly served by Render's static site service.
    * Initial attempts frequently resulted in "404 Not Found" errors when directly accessing routes like `/login` or `/hotels`.

 ## 🤔 Assumptions
* **"Şimdi Rezervasyon Yap" Button Functionality:** The "Şimdi Rezervasyon Yap" button is currently present in the UI for demonstration purposes but is **not yet fully functional**.
* The core booking logic and backend integration for reservations are still under development.

## Web Application Link

https://se3355-final-hotel-web-app-frontend.onrender.com/

## 🎥 Project Demo Video

https://drive.google.com/file/d/1_aZ8qyFLDZLDZ_tM_rkD47tmPF3eIGKG/view





