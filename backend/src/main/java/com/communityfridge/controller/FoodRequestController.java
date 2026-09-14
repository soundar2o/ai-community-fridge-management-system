package com.communityfridge.controller;

import com.communityfridge.dto.CreateFoodRequest;
import com.communityfridge.dto.FoodRequestDto;
import com.communityfridge.service.FoodRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class FoodRequestController {

    private final FoodRequestService foodRequestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEIVER', 'NGO', 'ADMIN')")
    public ResponseEntity<FoodRequestDto> createRequest(
            @Valid @RequestBody CreateFoodRequest request,
            Authentication authentication) {
        FoodRequestDto dto = foodRequestService.createRequest(request, authentication.getName());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasAnyRole('RECEIVER', 'NGO', 'ADMIN')")
    public ResponseEntity<List<FoodRequestDto>> getMyRequests(Authentication authentication) {
        return ResponseEntity.ok(foodRequestService.getMyRequests(authentication.getName()));
    }

    @GetMapping("/pending-donation-ids")
    @PreAuthorize("hasAnyRole('RECEIVER', 'NGO', 'ADMIN')")
    public ResponseEntity<List<Long>> getPendingDonationIds(Authentication authentication) {
        return ResponseEntity.ok(foodRequestService.getPendingDonationIdsForReceiver(authentication.getName()));
    }

    @GetMapping("/donor")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<List<FoodRequestDto>> getDonorRequests(Authentication authentication) {
        return ResponseEntity.ok(foodRequestService.getRequestsForDonor(authentication.getName()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<FoodRequestDto> approveRequest(
            @PathVariable Long id,
            Authentication authentication) {
        FoodRequestDto dto = foodRequestService.approveRequest(id, authentication.getName());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<FoodRequestDto> rejectRequest(
            @PathVariable Long id,
            Authentication authentication) {
        FoodRequestDto dto = foodRequestService.rejectRequest(id, authentication.getName());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/activity")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<List<FoodRequestDto>> getDistributionActivity() {
        return ResponseEntity.ok(foodRequestService.getRecentDistributionActivity());
    }
}
