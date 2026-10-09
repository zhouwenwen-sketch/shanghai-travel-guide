package com.shanghai.travelbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "itinerary_items")
public class ItineraryItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "itinerary_id") private Itinerary itinerary;
    @Column(name = "item_date", nullable = false) private LocalDate itemDate;
    @Column(name = "day_number", nullable = false) private Integer dayNumber;
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private ItineraryItemType type;
    @Column(name = "start_time") private LocalTime startTime;
    @Column(name = "end_time") private LocalTime endTime;
    @Column(nullable = false, length = 120) private String title;
    @Column(length = 200) private String location;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "sort_order", nullable = false) private Integer sortOrder;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "hotel_id") private Hotel hotel;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "poi_id") private Poi poi;
}
