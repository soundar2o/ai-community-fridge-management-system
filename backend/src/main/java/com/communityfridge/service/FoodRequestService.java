package com.communityfridge.service;

import com.communityfridge.dto.CreateFoodRequest;
import com.communityfridge.dto.FoodRequestDto;

import java.util.List;

public interface FoodRequestService {

    FoodRequestDto createRequest(CreateFoodRequest request, String receiverEmail);

    List<FoodRequestDto> getMyRequests(String receiverEmail);

    List<Long> getPendingDonationIdsForReceiver(String receiverEmail);

    List<FoodRequestDto> getRequestsForDonor(String donorEmail);

    FoodRequestDto approveRequest(Long requestId, String donorEmail);

    FoodRequestDto rejectRequest(Long requestId, String donorEmail);

    List<FoodRequestDto> getRecentDistributionActivity();
}
