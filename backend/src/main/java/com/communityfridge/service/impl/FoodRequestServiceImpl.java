package com.communityfridge.service.impl;

import com.communityfridge.dto.CreateFoodRequest;
import com.communityfridge.dto.FoodRequestDto;
import com.communityfridge.model.*;
import com.communityfridge.repository.FoodDonationRepository;
import com.communityfridge.repository.FoodRequestRepository;
import com.communityfridge.repository.NotificationRepository;
import com.communityfridge.repository.UserRepository;
import com.communityfridge.service.FoodRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodRequestServiceImpl implements FoodRequestService {

    private final FoodRequestRepository requestRepository;
    private final FoodDonationRepository donationRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public FoodRequestDto createRequest(CreateFoodRequest request, String receiverEmail) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("Receiver user not found: " + receiverEmail));

        if (receiver.getRole() != Role.RECEIVER && receiver.getRole() != Role.NGO && receiver.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only registered receivers and NGOs can request food.");
        }

        FoodDonation donation = donationRepository.findById(request.getDonationId())
                .orElseThrow(() -> new RuntimeException("Food donation not found with ID: " + request.getDonationId()));

        if (donation.getExpiryDatetime() != null && donation.getExpiryDatetime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("This food item has expired and is no longer available.");
        }

        if (donation.getStatus() == DonationStatus.REJECTED || donation.getStatus() == DonationStatus.EXPIRED || donation.getStatus() == DonationStatus.COLLECTED) {
            throw new IllegalStateException("This food item is no longer available.");
        }

        if (request.getRequestedQuantity() == null || request.getRequestedQuantity() <= 0) {
            throw new IllegalArgumentException("Requested quantity must be at least 1.");
        }

        if (request.getRequestedQuantity() > donation.getQuantity()) {
            throw new IllegalArgumentException("Requested quantity (" + request.getRequestedQuantity() +
                    ") exceeds available quantity (" + donation.getQuantity() + " " + donation.getUnit() + ").");
        }

        boolean alreadyPending = requestRepository.existsByFoodDonation_IdAndReceiver_IdAndStatusIn(
                donation.getId(),
                receiver.getId(),
                List.of(RequestStatus.PENDING)
        );

        if (alreadyPending) {
            throw new IllegalStateException("You already have a pending request for this food.");
        }

        FoodRequest foodRequest = FoodRequest.builder()
                .foodDonation(donation)
                .receiver(receiver)
                .requestedQuantity(request.getRequestedQuantity())
                .status(RequestStatus.PENDING)
                .build();

        FoodRequest saved = requestRepository.save(foodRequest);

        // Notify Donor of new food request
        String fridgeName = (donation.getFridge() != null) ? donation.getFridge().getName() : "Community Fridge";
        Notification donorNotif = Notification.builder()
                .user(donation.getDonor())
                .title("New Food Request Received")
                .message("User " + receiver.getName() + " requested " + request.getRequestedQuantity() + " " + donation.getUnit() +
                        " of '" + donation.getFoodName() + "' at " + fridgeName + ".")
                .isRead(false)
                .build();
        notificationRepository.save(donorNotif);

        FoodRequestDto dto = mapToDto(saved);
        dto.setMessage("Food request submitted successfully");
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FoodRequestDto> getMyRequests(String receiverEmail) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("Receiver user not found"));

        return requestRepository.findByReceiver_IdOrderByCreatedAtDesc(receiver.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getPendingDonationIdsForReceiver(String receiverEmail) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("Receiver user not found"));

        return requestRepository.findByReceiver_IdAndStatusIn(receiver.getId(), List.of(RequestStatus.PENDING)).stream()
                .map(req -> req.getFoodDonation().getId())
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FoodRequestDto> getRequestsForDonor(String donorEmail) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + donorEmail));

        if (donor.getRole() != Role.DONOR && donor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only donors and admins can view donor request management.");
        }

        List<FoodRequest> requests;
        if (donor.getRole() == Role.ADMIN) {
            requests = requestRepository.findAll();
        } else {
            requests = requestRepository.findByFoodDonation_Donor_IdOrderByCreatedAtDesc(donor.getId());
        }

        return requests.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FoodRequestDto approveRequest(Long requestId, String donorEmail) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + donorEmail));

        if (donor.getRole() != Role.DONOR && donor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only donors and admins can approve food requests.");
        }

        FoodRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Food request not found with ID: " + requestId));

        // Ownership validation
        if (donor.getRole() != Role.ADMIN && !req.getFoodDonation().getDonor().getId().equals(donor.getId())) {
            throw new AccessDeniedException("You are not authorized to manage requests for another donor's food donation.");
        }

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Only PENDING food requests can be approved. Current status: " + req.getStatus());
        }

        // Re-fetch latest donation using pessimistic write lock for thread-safe concurrency
        FoodDonation donation = donationRepository.findByIdForUpdate(req.getFoodDonation().getId())
                .orElseThrow(() -> new RuntimeException("Associated food donation not found"));

        if (donation.getExpiryDatetime() != null && donation.getExpiryDatetime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("This food donation has expired and cannot be approved.");
        }

        if (req.getRequestedQuantity() > donation.getQuantity()) {
            throw new IllegalStateException("Cannot approve request of " + req.getRequestedQuantity() + " " + donation.getUnit() +
                    ". Currently available quantity is only " + donation.getQuantity() + " " + donation.getUnit() + ".");
        }

        // Deduct inventory atomically
        int updatedQty = donation.getQuantity() - req.getRequestedQuantity();
        donation.setQuantity(updatedQty);
        if (updatedQty == 0) {
            donation.setStatus(DonationStatus.COLLECTED);
        }
        donationRepository.save(donation);

        // Update request status
        req.setStatus(RequestStatus.APPROVED);
        FoodRequest savedReq = requestRepository.save(req);

        // Receiver Notification
        String fridgeName = (donation.getFridge() != null) ? donation.getFridge().getName() : "Community Fridge";
        Notification notification = Notification.builder()
                .user(req.getReceiver())
                .title("Food Request Approved")
                .message("Your request for " + req.getRequestedQuantity() + " " + donation.getUnit() +
                        " of '" + donation.getFoodName() + "' at " + fridgeName + " has been approved.")
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        FoodRequestDto dto = mapToDto(savedReq);
        dto.setMessage("Food request approved successfully");
        return dto;
    }

    @Override
    @Transactional
    public FoodRequestDto rejectRequest(Long requestId, String donorEmail) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + donorEmail));

        if (donor.getRole() != Role.DONOR && donor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only donors and admins can reject food requests.");
        }

        FoodRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Food request not found with ID: " + requestId));

        // Ownership validation
        if (donor.getRole() != Role.ADMIN && !req.getFoodDonation().getDonor().getId().equals(donor.getId())) {
            throw new AccessDeniedException("You are not authorized to manage requests for another donor's food donation.");
        }

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Only PENDING food requests can be rejected. Current status: " + req.getStatus());
        }

        req.setStatus(RequestStatus.REJECTED);
        FoodRequest savedReq = requestRepository.save(req);

        // Receiver Notification
        Notification notification = Notification.builder()
                .user(req.getReceiver())
                .title("Food Request Rejected")
                .message("Your request for " + req.getRequestedQuantity() + " " + req.getFoodDonation().getUnit() +
                        " of '" + req.getFoodDonation().getFoodName() + "' was rejected by the donor.")
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        FoodRequestDto dto = mapToDto(savedReq);
        dto.setMessage("Food request rejected successfully");
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FoodRequestDto> getRecentDistributionActivity() {
        return requestRepository.findTop30ByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private FoodRequestDto mapToDto(FoodRequest req) {
        FoodDonation donation = req.getFoodDonation();
        User receiver = req.getReceiver();
        CommunityFridge fridge = (donation != null) ? donation.getFridge() : null;

        return FoodRequestDto.builder()
                .id(req.getId())
                .donationId(donation != null ? donation.getId() : null)
                .foodName(donation != null ? donation.getFoodName() : "Unknown Item")
                .category(donation != null ? donation.getCategory() : "")
                .unit(donation != null ? donation.getUnit() : "items")
                .receiverId(receiver != null ? receiver.getId() : null)
                .receiverName(receiver != null ? receiver.getName() : "Unknown Receiver")
                .fridgeId(fridge != null ? fridge.getId() : null)
                .fridgeName(fridge != null ? fridge.getName() : "Unknown Fridge")
                .fridgeLocation(fridge != null ? fridge.getLocation() : "")
                .requestedQuantity(req.getRequestedQuantity())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
