package com.communityfridge.controller;

import com.communityfridge.dto.CommunityFridgeDto;
import com.communityfridge.dto.CreateFridgeRequest;
import com.communityfridge.model.FridgeStatus;
import com.communityfridge.service.CommunityFridgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fridges")
@RequiredArgsConstructor
public class CommunityFridgeController {

    private final CommunityFridgeService fridgeService;

    @GetMapping
    public ResponseEntity<List<CommunityFridgeDto>> getAllFridges() {
        return ResponseEntity.ok(fridgeService.getAllFridges());
    }

    @GetMapping("/active")
    public ResponseEntity<List<CommunityFridgeDto>> getActiveFridges() {
        return ResponseEntity.ok(fridgeService.getActiveFridges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityFridgeDto> getFridgeById(@PathVariable Long id) {
        return ResponseEntity.ok(fridgeService.getFridgeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommunityFridgeDto> createFridge(@Valid @RequestBody CreateFridgeRequest request) {
        return ResponseEntity.ok(fridgeService.createFridge(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommunityFridgeDto> updateFridge(
            @PathVariable Long id,
            @Valid @RequestBody CreateFridgeRequest request) {
        return ResponseEntity.ok(fridgeService.updateFridge(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<CommunityFridgeDto> updateFridgeStatus(
            @PathVariable Long id,
            @RequestParam FridgeStatus status) {
        return ResponseEntity.ok(fridgeService.updateFridgeStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFridge(@PathVariable Long id) {
        fridgeService.deleteFridge(id);
        return ResponseEntity.noContent().build();
    }
}
