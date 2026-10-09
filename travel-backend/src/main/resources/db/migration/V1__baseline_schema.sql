CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255), recommended BIT, star_level INT,
    img_url VARCHAR(255), banner_url VARCHAR(255), starimg_url VARCHAR(255),
    transport VARCHAR(255), phone VARCHAR(255), area VARCHAR(255),
    price_level VARCHAR(255), price INT, description TEXT,
    rating DOUBLE, review_count INT, review_desc VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT NOT NULL AUTO_INCREMENT, name VARCHAR(255), area VARCHAR(255),
    bed VARCHAR(255), price INT, breakfast VARCHAR(255), cancel_rule VARCHAR(255),
    hotel_id BIGINT, PRIMARY KEY (id),
    CONSTRAINT uk_rooms_hotel_name UNIQUE (hotel_id, name),
    CONSTRAINT fk_rooms_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT NOT NULL AUTO_INCREMENT, review_user VARCHAR(255), rating DOUBLE,
    date VARCHAR(255), content TEXT, reply TEXT, hotel_id BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT uk_reviews_hotel_user_date UNIQUE (hotel_id, review_user, date),
    CONSTRAINT fk_reviews_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hotel_tags (
    hotel_id BIGINT NOT NULL, tag VARCHAR(255) NOT NULL,
    CONSTRAINT uk_hotel_tags UNIQUE (hotel_id, tag),
    CONSTRAINT fk_hotel_tags_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT NOT NULL AUTO_INCREMENT, user_id BIGINT, hotel_id BIGINT,
    created_at DATETIME(6), PRIMARY KEY (id),
    CONSTRAINT uk_favorites_user_hotel UNIQUE (user_id, hotel_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_favorites_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS browse_history (
    id BIGINT NOT NULL AUTO_INCREMENT, user_id BIGINT, hotel_id BIGINT,
    browse_time BIGINT, PRIMARY KEY (id),
    INDEX idx_history_user_time (user_id, browse_time),
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_history_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
