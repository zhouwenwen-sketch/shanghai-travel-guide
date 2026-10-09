ALTER TABLE bookings
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN idempotency_key VARCHAR(64) NULL,
    ADD CONSTRAINT uq_booking_user_idempotency UNIQUE (user_id, idempotency_key),
    ADD CONSTRAINT chk_booking_date_range CHECK (check_out > check_in),
    ADD CONSTRAINT chk_booking_guest_count CHECK (guest_count BETWEEN 1 AND 10),
    ADD CONSTRAINT chk_booking_prices CHECK (nightly_price > 0 AND total_price > 0),
    ADD CONSTRAINT chk_booking_status CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    ADD CONSTRAINT chk_booking_cancel_state CHECK (
        (status = 'CONFIRMED' AND cancelled_at IS NULL)
        OR (status = 'CANCELLED' AND cancelled_at IS NOT NULL)
    );

ALTER TABLE itineraries
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0,
    ADD CONSTRAINT chk_itinerary_date_range CHECK (
        DATEDIFF(end_date, start_date) BETWEEN 0 AND 30
    );

ALTER TABLE itinerary_items
    ADD CONSTRAINT chk_item_day_number CHECK (day_number BETWEEN 1 AND 31),
    ADD CONSTRAINT chk_item_sort_order CHECK (sort_order BETWEEN 0 AND 10000),
    ADD CONSTRAINT chk_item_type CHECK (
        type IN ('HOTEL', 'ATTRACTION', 'RESTAURANT', 'ACTIVITY', 'NOTE')
    ),
    ADD CONSTRAINT chk_item_time_range CHECK (
        (start_time IS NULL AND end_time IS NULL)
        OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
    );
