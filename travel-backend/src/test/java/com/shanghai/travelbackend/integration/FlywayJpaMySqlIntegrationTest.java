package com.shanghai.travelbackend.integration;

import com.shanghai.travelbackend.dto.BookingResponse;
import com.shanghai.travelbackend.dto.CreateBookingRequest;
import com.shanghai.travelbackend.service.BookingService;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Arrays;
import java.time.LocalDate;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers(disabledWithoutDocker = true)
class FlywayJpaMySqlIntegrationTest {
    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.36")
            .withDatabaseName("travel_test")
            .withUsername("travel")
            .withPassword("travel");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("app.security.jwt.secret", () -> "test-only-jwt-secret-must-be-at-least-32-characters");
    }

    @Autowired private Flyway flyway;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private EntityManagerFactory entityManagerFactory;
    @Autowired private BookingService bookingService;

    @BeforeEach
    @AfterEach
    void cleanConcurrentBookingFixture() {
        jdbcTemplate.update("DELETE FROM bookings WHERE user_id IN (SELECT id FROM users WHERE username = ?)",
                "concurrent-booking-user");
        jdbcTemplate.update("DELETE FROM users WHERE username = ?", "concurrent-booking-user");
    }

    @Test
    void flywayAppliesV1ThroughV5AndJpaValidationStarts() {
        String[] versions = Arrays.stream(flyway.info().applied())
                .map(MigrationInfo::getVersion)
                .map(Object::toString)
                .toArray(String[]::new);

        assertThat(versions).contains("1", "2", "3", "4", "5");
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM pois", Integer.class)).isGreaterThanOrEqualTo(7);
        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'itinerary_items' AND column_name = 'poi_id'",
                Integer.class)).isEqualTo(1);
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM bookings", Integer.class)).isZero();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM itineraries", Integer.class)).isZero();
        assertThat(entityManagerFactory).isNotNull();
    }

    @Test
    void concurrentSameUserAndIdempotencyKeyCreatesOneBookingAndReturnsSameResult() throws Exception {
        jdbcTemplate.update("INSERT INTO users(username, password, created_at) VALUES (?, ?, NOW(6))",
                "concurrent-booking-user", "unused-test-password");
        Long userId = jdbcTemplate.queryForObject(
                "SELECT id FROM users WHERE username = ?", Long.class, "concurrent-booking-user");
        Long hotelId = jdbcTemplate.queryForObject("SELECT MIN(id) FROM hotels", Long.class);
        LocalDate checkIn = LocalDate.now().plusDays(5);
        CreateBookingRequest request = new CreateBookingRequest(
                hotelId, checkIn, checkIn.plusDays(2), 2, "小雯", "13800138000");
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<BookingResponse> first = executor.submit(() -> {
                start.await();
                return bookingService.create(userId, "concurrent-key", request);
            });
            Future<BookingResponse> second = executor.submit(() -> {
                start.await();
                return bookingService.create(userId, "concurrent-key", request);
            });
            start.countDown();

            BookingResponse firstResult = first.get(10, TimeUnit.SECONDS);
            BookingResponse secondResult = second.get(10, TimeUnit.SECONDS);

            assertThat(firstResult.id()).isEqualTo(secondResult.id());
            assertThat(jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM bookings WHERE user_id = ? AND idempotency_key = ?",
                    Integer.class, userId, "concurrent-key")).isEqualTo(1);
        } finally {
            executor.shutdownNow();
        }
    }
}
