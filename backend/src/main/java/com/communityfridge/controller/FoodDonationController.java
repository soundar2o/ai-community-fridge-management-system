package com.communityfridge.controller;

import com.communityfridge.dto.CreateDonationRequest;
import com.communityfridge.dto.FoodDonationDto;
import com.communityfridge.model.DonationStatus;
import com.communityfridge.service.FoodDonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class FoodDonationController {

    private final FoodDonationService donationService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<FoodDonationDto> createDonation(
            @Valid @RequestPart("request") CreateDonationRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication authentication) {
        FoodDonationDto dto = donationService.createDonation(request, image, authentication.getName());
        return ResponseEntity.ok(dto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<FoodDonationDto> updateDonation(
            @PathVariable Long id,
            @Valid @RequestPart("request") CreateDonationRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication authentication) {
        FoodDonationDto dto = donationService.updateDonation(id, request, image, authentication.getName());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<List<FoodDonationDto>> getMyDonations(Authentication authentication) {
        return ResponseEntity.ok(donationService.getDonationsByDonor(authentication.getName()));
    }

    @GetMapping("/available")
    public ResponseEntity<List<FoodDonationDto>> getAvailableFood(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long fridgeId,
            @RequestParam(required = false, defaultValue = "") String search) {
        return ResponseEntity.ok(donationService.getAvailableFood(category, fridgeId, search));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<List<FoodDonationDto>> getPendingDonations() {
        return ResponseEntity.ok(donationService.getPendingVerificationDonations());
    }

    @GetMapping("/expired")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<List<FoodDonationDto>> getExpiredDonations() {
        return ResponseEntity.ok(donationService.getExpiredDonations());
    }

    @GetMapping("/nearing-expiry")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<List<FoodDonationDto>> getNearingExpiryDonations() {
        return ResponseEntity.ok(donationService.getNearingExpiryDonations());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<FoodDonationDto> approveDonation(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(donationService.approveDonation(id, authentication.getName()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<FoodDonationDto> rejectDonation(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        return ResponseEntity.ok(donationService.rejectDonation(id, reason, authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<FoodDonationDto> updateDonationStatus(
            @PathVariable Long id,
            @RequestParam DonationStatus status,
            Authentication authentication) {
        if (status == DonationStatus.APPROVED || status == DonationStatus.AVAILABLE) {
            return ResponseEntity.ok(donationService.approveDonation(id, authentication.getName()));
        } else if (status == DonationStatus.REJECTED) {
            return ResponseEntity.ok(donationService.rejectDonation(id, null, authentication.getName()));
        }
        return ResponseEntity.ok(donationService.updateDonationStatus(id, status, authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodDonationDto> getDonationById(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.getDonationById(id));
    }
}
