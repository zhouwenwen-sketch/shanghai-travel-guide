package com.shanghai.travelbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.BatchSize;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "pois")
public class Poi {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String name;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 30) private PoiType type;
    @Column(nullable = false, length = 50) private String area;
    @Column(nullable = false, length = 200) private String address;
    @Column(nullable = false, precision = 10, scale = 7) private BigDecimal latitude;
    @Column(nullable = false, precision = 10, scale = 7) private BigDecimal longitude;
    @Column(name = "opening_hours", length = 200) private String openingHours;
    @Column(name = "ticket_price", precision = 10, scale = 2) private BigDecimal ticketPrice;
    @Column(name = "average_price", precision = 10, scale = 2) private BigDecimal averagePrice;
    @Column(name = "suggested_duration_minutes") private Integer suggestedDurationMinutes;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "image_url", length = 500) private String imageUrl;
    @Column(precision = 2, scale = 1) private BigDecimal rating;
    @Column(nullable = false) private Boolean recommended = false;
    @Column(nullable = false) private Boolean active = true;
    @Version @Column(nullable = false) private Long version;
    @ElementCollection
    @BatchSize(size = 50)
    @CollectionTable(name = "poi_tags", joinColumns = @JoinColumn(name = "poi_id"))
    @Column(name = "tag", nullable = false, length = 50)
    private List<String> tags = new ArrayList<>();
}
