package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.Room;

public record RoomResponse(
        Long id,
        String name,
        String area,
        String bed,
        Integer price,
        String breakfast,
        String cancel
) {
    public static RoomResponse from(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getName(),
                room.getArea(),
                room.getBed(),
                room.getPrice(),
                room.getBreakfast(),
                room.getCancel()
        );
    }
}
