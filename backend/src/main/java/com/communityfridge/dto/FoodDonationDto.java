package com.communityfridge.dto;

import com.communityfridge.model.DonationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodDonationDto {
    private Long id;
    private Long donorId;
    private String donorName;
    private Long fridgeId;
    private String fridgeName;
    private String fridgeLocation;
    private String foodName;
    private String category;
    private Integer quantity;
    private String unit;
    private String imageUrl;
    private LocalDateTime expiryDatetime;
    private DonationStatus status;
    private LocalDateTime createdAt;
}
