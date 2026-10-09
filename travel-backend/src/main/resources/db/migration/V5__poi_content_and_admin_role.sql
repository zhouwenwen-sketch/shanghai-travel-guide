ALTER TABLE users
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER',
    ADD CONSTRAINT chk_user_role CHECK (role IN ('USER', 'ADMIN'));

CREATE TABLE pois (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(30) NOT NULL,
    area VARCHAR(50) NOT NULL,
    address VARCHAR(200) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    opening_hours VARCHAR(200),
    ticket_price DECIMAL(10,2),
    average_price DECIMAL(10,2),
    suggested_duration_minutes INT,
    description TEXT,
    image_url VARCHAR(500),
    rating DECIMAL(2,1),
    recommended BIT NOT NULL DEFAULT b'0',
    active BIT NOT NULL DEFAULT b'1',
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_poi_type_area_active (type, area, active),
    INDEX idx_poi_recommended_active (recommended, active),
    CONSTRAINT chk_poi_type CHECK (type IN ('ATTRACTION', 'RESTAURANT', 'BUSINESS_DISTRICT')),
    CONSTRAINT chk_poi_ticket_price CHECK (ticket_price IS NULL OR ticket_price >= 0),
    CONSTRAINT chk_poi_average_price CHECK (average_price IS NULL OR average_price >= 0),
    CONSTRAINT chk_poi_duration CHECK (suggested_duration_minutes IS NULL OR suggested_duration_minutes BETWEEN 1 AND 1440),
    CONSTRAINT chk_poi_rating CHECK (rating IS NULL OR rating BETWEEN 0 AND 5),
    CONSTRAINT chk_poi_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_poi_longitude CHECK (longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE poi_tags (
    poi_id BIGINT NOT NULL,
    tag VARCHAR(50) NOT NULL,
    CONSTRAINT uq_poi_tags UNIQUE (poi_id, tag),
    CONSTRAINT fk_poi_tags_poi FOREIGN KEY (poi_id) REFERENCES pois(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE itinerary_items
    ADD COLUMN poi_id BIGINT NULL,
    ADD INDEX idx_itinerary_item_poi (poi_id),
    ADD CONSTRAINT fk_item_poi FOREIGN KEY (poi_id) REFERENCES pois(id);

INSERT INTO pois
    (name, type, area, address, latitude, longitude, opening_hours, ticket_price, average_price,
     suggested_duration_minutes, description, image_url, rating, recommended, active)
VALUES
    ('外滩', 'ATTRACTION', '黄浦区', '中山东一路', 31.2400100, 121.4904900, '全天开放', 0.00, NULL,
     120, '上海经典滨水景观，可远眺陆家嘴天际线和历史建筑群。', '/images/banner-1.jpg', 4.8, b'1', b'1'),
    ('上海博物馆人民广场馆', 'ATTRACTION', '黄浦区', '人民大道201号', 31.2303500, 121.4751900, '09:00-17:00，周一闭馆', 0.00, NULL,
     180, '以中国古代艺术收藏和展览见长的综合性博物馆。', '/images/banner-2.jpg', 4.7, b'1', b'1'),
    ('豫园', 'ATTRACTION', '黄浦区', '福佑路168号', 31.2271000, 121.4921200, '09:00-16:30', 40.00, NULL,
     120, '上海代表性的江南古典园林。', '/images/banner-3.jpg', 4.6, b'1', b'1'),
    ('小杨生煎黄河路店', 'RESTAURANT', '黄浦区', '黄河路97号', 31.2358200, 121.4701300, '07:00-21:30', NULL, 35.00,
     60, '以生煎馒头为特色的上海本地餐饮门店。', '/images/1.jpg', 4.5, b'1', b'1'),
    ('绿波廊酒楼', 'RESTAURANT', '黄浦区', '豫园路115号', 31.2274300, 121.4924100, '11:00-20:30', NULL, 180.00,
     90, '位于豫园商圈的上海本帮菜餐厅。', '/images/2.jpg', 4.5, b'0', b'1'),
    ('南京西路商圈', 'BUSINESS_DISTRICT', '静安区', '南京西路', 31.2299800, 121.4514800, '全天开放', NULL, NULL,
     180, '汇集购物中心、历史建筑和城市公共空间的核心商圈。', '/images/3.jpg', 4.6, b'1', b'1'),
    ('陆家嘴商圈', 'BUSINESS_DISTRICT', '浦东新区', '陆家嘴环路', 31.2381000, 121.5019500, '全天开放', NULL, NULL,
     180, '上海金融中心区域，可步行游览滨江与城市地标。', '/images/4.jpg', 4.7, b'1', b'1');

INSERT INTO poi_tags (poi_id, tag)
SELECT id, '城市地标' FROM pois WHERE name = '外滩'
UNION ALL SELECT id, '夜景' FROM pois WHERE name = '外滩'
UNION ALL SELECT id, '博物馆' FROM pois WHERE name = '上海博物馆人民广场馆'
UNION ALL SELECT id, '古典园林' FROM pois WHERE name = '豫园'
UNION ALL SELECT id, '上海小吃' FROM pois WHERE name = '小杨生煎黄河路店'
UNION ALL SELECT id, '本帮菜' FROM pois WHERE name = '绿波廊酒楼'
UNION ALL SELECT id, '购物' FROM pois WHERE name = '南京西路商圈'
UNION ALL SELECT id, '城市地标' FROM pois WHERE name = '陆家嘴商圈';
