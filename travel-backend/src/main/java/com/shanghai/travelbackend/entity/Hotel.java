package com.shanghai.travelbackend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "hotels")
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Boolean recommended;
    private Integer starLevel;

    @JsonProperty("img_url")
    @Column(name = "img_url")
    private String imgUrl;

    @JsonProperty("banner_url")
    @Column(name = "banner_url")
    private String bannerUrl;

    @JsonProperty("starimg_url")
    @Column(name = "starimg_url")
    private String starimgUrl;

    private String transport;
    private String phone;
    private String area;
    private String priceLevel;
    private Integer price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JsonProperty("tag")
    @ElementCollection
    @CollectionTable(name = "hotel_tags", joinColumns = @JoinColumn(name = "hotel_id"),
                      uniqueConstraints = @UniqueConstraint(columnNames = {"hotel_id", "tag"}))
    @Column(name = "tag")
    private List<String> tags;

    private Double rating;
    private Integer reviewCount;
    private String reviewDesc;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Room> rooms;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews;
}
