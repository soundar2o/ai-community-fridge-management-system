package com.communityfridge.dto;

import com.communityfridge.model.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodRequestDto {

    private Long id;
    private Long donationId;
    private String foodName;
    private String category;
    private String unit;
    private Long receiverId;
    private String receiverName;
    private Long fridgeId;
    private String fridgeName;
    private String fridgeLocation;
    private Integer requestedQuantity;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private String message;
}
