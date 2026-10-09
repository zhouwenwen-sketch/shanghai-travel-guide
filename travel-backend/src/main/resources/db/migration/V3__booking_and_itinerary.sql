CREATE TABLE bookings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL, hotel_id BIGINT NOT NULL,
    check_in DATE NOT NULL, check_out DATE NOT NULL,
    guest_count INT NOT NULL, contact_name VARCHAR(80) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL, nightly_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL, status VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL, cancelled_at DATETIME(6),
    PRIMARY KEY (id), INDEX idx_booking_user_created (user_id, created_at),
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_booking_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE itineraries (
    id BIGINT NOT NULL AUTO_INCREMENT, user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL,
    created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id), INDEX idx_itinerary_user_updated (user_id, updated_at),
    CONSTRAINT fk_itinerary_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE itinerary_items (
    id BIGINT NOT NULL AUTO_INCREMENT, itinerary_id BIGINT NOT NULL,
    item_date DATE NOT NULL, day_number INT NOT NULL, type VARCHAR(20) NOT NULL,
    start_time TIME, end_time TIME, title VARCHAR(120) NOT NULL,
    location VARCHAR(200), notes TEXT, sort_order INT NOT NULL, hotel_id BIGINT,
    PRIMARY KEY (id),
    INDEX idx_itinerary_item_order (itinerary_id, item_date, sort_order),
    CONSTRAINT fk_item_itinerary FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
