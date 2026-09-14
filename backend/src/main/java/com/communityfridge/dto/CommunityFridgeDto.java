package com.communityfridge.dto;

import com.communityfridge.model.FridgeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityFridgeDto {
    private Long id;
    private String name;
    private String location;
    private Double latitude;
    private Double longitude;
    private Double capacityKg;
    private Double currentOccupancyKg;
    private FridgeStatus status;
    private Long managedByUserId;
    private String managedByUserName;
    private Integer availableFoodCount;
    private LocalDateTime createdAt;
}
