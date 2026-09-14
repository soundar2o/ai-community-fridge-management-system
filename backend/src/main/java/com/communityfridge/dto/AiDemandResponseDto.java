package com.communityfridge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiDemandResponseDto {
    private Integer predictedDemand;
    private String demandLevel;
    private Double confidence;
    @JsonProperty("isPrototype")
    private Boolean isPrototype;
    private String modelType;
}
