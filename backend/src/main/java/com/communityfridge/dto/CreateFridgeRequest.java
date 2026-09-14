package com.communityfridge.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateFridgeRequest {

    @NotBlank(message = "Fridge name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    private Double latitude;

    private Double longitude;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be greater than 0 kg")
    private Double capacityKg;

    private Long managedByUserId;
}
