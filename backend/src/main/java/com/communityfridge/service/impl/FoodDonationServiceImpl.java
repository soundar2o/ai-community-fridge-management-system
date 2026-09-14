package com.communityfridge.service.impl;

import com.communityfridge.dto.CreateDonationRequest;
import com.communityfridge.dto.FoodDonationDto;
import com.communityfridge.model.*;
import com.communityfridge.repository.CommunityFridgeRepository;
import com.communityfridge.repository.DonationHistoryRepository;
import com.communityfridge.repository.FoodDonationRepository;
import com.communityfridge.repository.UserRepository;
import com.communityfridge.repository.NotificationRepository;
import com.communityfridge.service.FoodDonationService;
import com.communityfridge.util.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodDonationServiceImpl implements FoodDonationService {

    private final FoodDonationRepository donationRepository;
    private final CommunityFridgeRepository fridgeRepository;
    private final UserRepository userRepository;
    private final DonationHistoryRepository historyRepository;
    private final FileStorageService fileStorageService;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public FoodDonationDto createDonation(CreateDonationRequest request, MultipartFile image, String donorEmail) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new RuntimeException("Donor user not found"));

        CommunityFridge fridge = fridgeRepository.findById(request.getFridgeId())
                .orElseThrow(() -> new RuntimeException("Fridge not found with ID: " + request.getFridgeId()));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeFile(image);
        }

        FoodDonation donation = FoodDonation.builder()
                .donor(donor)
                .fridge(fridge)
                .foodName(request.getFoodName())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .imageUrl(imageUrl)
                .expiryDatetime(request.getExpiryDatetime())
                .status(DonationStatus.PENDING)
                .build();

        FoodDonation saved = donationRepository.save(donation);

        // Audit History
        DonationHistory history = DonationHistory.builder()
                .foodDonation(saved)
                .actionByUser(donor)
                .action("DONATION_CREATED")
                .notes("Donation registered pending volunteer verification")
                .build();
        historyRepository.save(history);

        return mapToDto(saved);
    }

    @Override
    public List<FoodDonationDto> getDonationsByDonor(String donorEmail) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        return donationRepository.findByDonor_IdOrderByCreatedAtDesc(donor.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FoodDonationDto> getAvailableFood(String category, Long fridgeId, String search) {
        String searchQuery = (search == null) ? "" : search;
        return donationRepository.searchAvailableFood(category, fridgeId, searchQuery).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FoodDonationDto> getPendingVerificationDonations() {
        return donationRepository.findByStatusIn(List.of(DonationStatus.PENDING, DonationStatus.PENDING_VERIFICATION)).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FoodDonationDto> getExpiredDonations() {
        return donationRepository.findByStatus(DonationStatus.EXPIRED).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FoodDonationDto> getNearingExpiryDonations() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime threshold = now.plusHours(48);
        return donationRepository.findNearingExpiryDonations(now, threshold).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FoodDonationDto updateDonationStatus(Long donationId, DonationStatus status, String actorEmail) {
        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found"));

        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        donation.setStatus(status);
        FoodDonation updated = donationRepository.save(donation);

        // Record Audit Log
        DonationHistory history = DonationHistory.builder()
                .foodDonation(updated)
                .actionByUser(actor)
                .action("STATUS_UPDATED_" + status.name())
                .notes("Status updated to " + status.name() + " by " + actor.getName())
                .build();
        historyRepository.save(history);

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public FoodDonationDto approveDonation(Long donationId, String actorEmail) {
        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found with ID: " + donationId));

        if (donation.getStatus() != DonationStatus.PENDING && donation.getStatus() != DonationStatus.PENDING_VERIFICATION) {
            throw new IllegalStateException("Only PENDING food donations can be approved. Current status: " + donation.getStatus());
        }

        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + actorEmail));

        donation.setStatus(DonationStatus.APPROVED);
        FoodDonation updated = donationRepository.save(donation);

        DonationHistory history = DonationHistory.builder()
                .foodDonation(updated)
                .actionByUser(actor)
                .action("DONATION_APPROVED")
                .notes("Donation approved by " + actor.getRole() + " (" + actor.getName() + ")")
                .build();
        historyRepository.save(history);

        try {
            Notification notification = Notification.builder()
                    .user(donation.getDonor())
                    .title("Food Donation Verified & Approved")
                    .message("Your donation '" + donation.getFoodName() + "' was verified by volunteer/admin and is now available at " + donation.getFridge().getName() + ".")
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        } catch (Exception ignored) {}

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public FoodDonationDto rejectDonation(Long donationId, String reason, String actorEmail) {
        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found with ID: " + donationId));

        if (donation.getStatus() != DonationStatus.PENDING && donation.getStatus() != DonationStatus.PENDING_VERIFICATION) {
            throw new IllegalStateException("Only PENDING food donations can be rejected. Current status: " + donation.getStatus());
        }

        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + actorEmail));

        donation.setStatus(DonationStatus.REJECTED);
        FoodDonation updated = donationRepository.save(donation);

        String notes = "Donation rejected by " + actor.getRole() + " (" + actor.getName() + ")";
        if (reason != null && !reason.trim().isEmpty()) {
            notes += ". Reason: " + reason.trim();
        }

        DonationHistory history = DonationHistory.builder()
                .foodDonation(updated)
                .actionByUser(actor)
                .action("DONATION_REJECTED")
                .notes(notes)
                .build();
        historyRepository.save(history);

        try {
            Notification notification = Notification.builder()
                    .user(donation.getDonor())
                    .title("Food Donation Safety Check Rejected")
                    .message("Your donation '" + donation.getFoodName() + "' was rejected during safety check. " + (reason != null ? "Reason: " + reason : ""))
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        } catch (Exception ignored) {}

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public FoodDonationDto updateDonation(Long id, CreateDonationRequest request, MultipartFile image, String userEmail) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found with ID: " + id));

        User actor = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!donation.getDonor().getId().equals(actor.getId()) && actor.getRole() != Role.ADMIN) {
            throw new RuntimeException("You are not authorized to update this donation");
        }

        CommunityFridge fridge = fridgeRepository.findById(request.getFridgeId())
                .orElseThrow(() -> new RuntimeException("Fridge not found with ID: " + request.getFridgeId()));

        donation.setFridge(fridge);
        donation.setFoodName(request.getFoodName());
        donation.setCategory(request.getCategory());
        donation.setQuantity(request.getQuantity());
        donation.setUnit(request.getUnit());
        donation.setExpiryDatetime(request.getExpiryDatetime());

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(image);
            donation.setImageUrl(imageUrl);
        }

        FoodDonation updated = donationRepository.save(donation);

        DonationHistory history = DonationHistory.builder()
                .foodDonation(updated)
                .actionByUser(actor)
                .action("DONATION_UPDATED")
                .notes("Donation details updated by " + actor.getName())
                .build();
        historyRepository.save(history);

        return mapToDto(updated);
    }

    @Override
    public FoodDonationDto getDonationById(Long id) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found"));
        return mapToDto(donation);
    }

    private FoodDonationDto mapToDto(FoodDonation donation) {
        return FoodDonationDto.builder()
                .id(donation.getId())
                .donorId(donation.getDonor().getId())
                .donorName(donation.getDonor().getName())
                .fridgeId(donation.getFridge().getId())
                .fridgeName(donation.getFridge().getName())
                .fridgeLocation(donation.getFridge().getLocation())
                .foodName(donation.getFoodName())
                .category(donation.getCategory())
                .quantity(donation.getQuantity())
                .unit(donation.getUnit())
                .imageUrl(donation.getImageUrl())
                .expiryDatetime(donation.getExpiryDatetime())
                .status(donation.getStatus())
                .createdAt(donation.getCreatedAt())
                .build();
    }
}
