package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.Review;

public record ReviewResponse(
        Long id,
        String user,
        Double rating,
        String date,
        String content,
        String reply
) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUser(),
                review.getRating(),
                review.getDate(),
                review.getContent(),
                review.getReply()
        );
    }
}
