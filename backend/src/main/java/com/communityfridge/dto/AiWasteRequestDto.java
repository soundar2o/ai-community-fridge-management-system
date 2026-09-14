package com.communityfridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiWasteRequestDto {
    private Integer quantity;
    private String category;
    private Double daysUntilExpiry;
    private Long fridgeId;
}
