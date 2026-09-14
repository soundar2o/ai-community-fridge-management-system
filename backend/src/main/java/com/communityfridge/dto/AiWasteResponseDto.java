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
public class AiWasteResponseDto {
    private String wasteRisk;
    private Double riskScore;
    @JsonProperty("isPrototype")
    private Boolean isPrototype;
    private String modelType;
}
