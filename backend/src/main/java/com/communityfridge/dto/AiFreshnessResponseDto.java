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
public class AiFreshnessResponseDto {
    private String label;
    private Double confidence;
    private Double freshnessScore;
    private String details;
    @JsonProperty("isPrototype")
    private Boolean isPrototype;
    private String modelType;
}
