package com.communityfridge.service;

import com.communityfridge.dto.CreateDonationRequest;
import com.communityfridge.dto.FoodDonationDto;
import com.communityfridge.model.DonationStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FoodDonationService {
    FoodDonationDto createDonation(CreateDonationRequest request, MultipartFile image, String donorEmail);
    List<FoodDonationDto> getDonationsByDonor(String donorEmail);
    List<FoodDonationDto> getAvailableFood(String category, Long fridgeId, String search);
    List<FoodDonationDto> getPendingVerificationDonations();
    List<FoodDonationDto> getExpiredDonations();
    List<FoodDonationDto> getNearingExpiryDonations();
    FoodDonationDto updateDonationStatus(Long donationId, DonationStatus status, String actorEmail);
    FoodDonationDto approveDonation(Long donationId, String actorEmail);
    FoodDonationDto rejectDonation(Long donationId, String reason, String actorEmail);
    FoodDonationDto updateDonation(Long id, CreateDonationRequest request, MultipartFile image, String userEmail);
    FoodDonationDto getDonationById(Long id);
}
