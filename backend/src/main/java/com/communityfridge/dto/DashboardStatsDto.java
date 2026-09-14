package com.communityfridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalUsers;
    private long totalFridges;
    private long activeFridges;
    private long totalDonations;
    private long totalSavedMeals;
    private long completedCollections;
    private long expiredDonations;
    private Map<String, Long> usersByRole;
    private Map<String, Long> donationsByStatus;
}
