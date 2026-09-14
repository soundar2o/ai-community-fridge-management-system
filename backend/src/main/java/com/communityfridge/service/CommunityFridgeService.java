package com.communityfridge.service;

import com.communityfridge.dto.CommunityFridgeDto;
import com.communityfridge.dto.CreateFridgeRequest;
import com.communityfridge.model.FridgeStatus;

import java.util.List;

public interface CommunityFridgeService {
    List<CommunityFridgeDto> getAllFridges();
    List<CommunityFridgeDto> getActiveFridges();
    CommunityFridgeDto getFridgeById(Long id);
    CommunityFridgeDto createFridge(CreateFridgeRequest request);
    CommunityFridgeDto updateFridge(Long id, CreateFridgeRequest request);
    CommunityFridgeDto updateFridgeStatus(Long id, FridgeStatus status);
    void deleteFridge(Long id);
}
