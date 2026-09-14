package com.communityfridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiDemandRequestDto {
    private Long fridgeId;
    private String category;
    private List<Integer> historicalDemand;
}
