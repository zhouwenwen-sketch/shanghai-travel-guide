package com.shanghai.travelbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "bookings")
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Version @Column(nullable = false) private Long version;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "hotel_id") private Hotel hotel;
    @Column(name = "check_in", nullable = false) private LocalDate checkIn;
    @Column(name = "check_out", nullable = false) private LocalDate checkOut;
    @Column(name = "guest_count", nullable = false) private Integer guestCount;
    @Column(name = "contact_name", nullable = false, length = 80) private String contactName;
    @Column(name = "contact_phone", nullable = false, length = 30) private String contactPhone;
    @Column(name = "nightly_price", nullable = false, precision = 12, scale = 2) private BigDecimal nightlyPrice;
    @Column(name = "total_price", nullable = false, precision = 12, scale = 2) private BigDecimal totalPrice;
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private BookingStatus status;
    @Column(name = "created_at", nullable = false) private LocalDateTime createdAt;
    @Column(name = "cancelled_at") private LocalDateTime cancelledAt;
    @Column(name = "idempotency_key", length = 64) private String idempotencyKey;
}
