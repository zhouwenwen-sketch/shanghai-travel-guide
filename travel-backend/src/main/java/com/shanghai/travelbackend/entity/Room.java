package com.shanghai.travelbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rooms", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"hotel_id", "name"})
})
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String area;    // 如 "42m²"
    private String bed;     // 如 "大床1.8m"
    private Integer price;
    private String breakfast;
    @Column(name = "cancel_rule")
    private String cancel;  // 取消规则

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    @JsonIgnore
    private Hotel hotel;
}
