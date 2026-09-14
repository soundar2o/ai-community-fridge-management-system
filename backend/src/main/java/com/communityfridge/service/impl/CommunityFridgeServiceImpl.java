package com.communityfridge.service.impl;

import com.communityfridge.dto.CommunityFridgeDto;
import com.communityfridge.dto.CreateFridgeRequest;
import com.communityfridge.model.CommunityFridge;
import com.communityfridge.model.FridgeStatus;
import com.communityfridge.model.User;
import com.communityfridge.model.DonationStatus;
import com.communityfridge.repository.CommunityFridgeRepository;
import com.communityfridge.repository.FoodDonationRepository;
import com.communityfridge.repository.UserRepository;
import com.communityfridge.service.CommunityFridgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityFridgeServiceImpl implements CommunityFridgeService {

    private final CommunityFridgeRepository fridgeRepository;
    private final UserRepository userRepository;
    private final FoodDonationRepository donationRepository;

    @Override
    public List<CommunityFridgeDto> getAllFridges() {
        return fridgeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CommunityFridgeDto> getActiveFridges() {
        return fridgeRepository.findByStatus(FridgeStatus.ACTIVE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CommunityFridgeDto getFridgeById(Long id) {
        CommunityFridge fridge = fridgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fridge not found with ID: " + id));
        return mapToDto(fridge);
    }

    @Override
    @Transactional
    public CommunityFridgeDto createFridge(CreateFridgeRequest request) {
        User manager = null;
        if (request.getManagedByUserId() != null) {
            manager = userRepository.findById(request.getManagedByUserId())
                    .orElse(null);
        }

        CommunityFridge fridge = CommunityFridge.builder()
                .name(request.getName())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .capacityKg(request.getCapacityKg())
                .currentOccupancyKg(0.0)
                .status(FridgeStatus.ACTIVE)
                .managedBy(manager)
                .build();

        CommunityFridge savedFridge = fridgeRepository.save(fridge);
        return mapToDto(savedFridge);
    }

    @Override
    @Transactional
    public CommunityFridgeDto updateFridge(Long id, CreateFridgeRequest request) {
        CommunityFridge fridge = fridgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fridge not found with ID: " + id));

        fridge.setName(request.getName());
        fridge.setLocation(request.getLocation());
        fridge.setLatitude(request.getLatitude());
        fridge.setLongitude(request.getLongitude());
        fridge.setCapacityKg(request.getCapacityKg());

        if (request.getManagedByUserId() != null) {
            User manager = userRepository.findById(request.getManagedByUserId()).orElse(null);
            fridge.setManagedBy(manager);
        }

        CommunityFridge updatedFridge = fridgeRepository.save(fridge);
        return mapToDto(updatedFridge);
    }

    @Override
    @Transactional
    public CommunityFridgeDto updateFridgeStatus(Long id, FridgeStatus status) {
        CommunityFridge fridge = fridgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fridge not found with ID: " + id));

        fridge.setStatus(status);
        CommunityFridge updatedFridge = fridgeRepository.save(fridge);
        return mapToDto(updatedFridge);
    }

    @Override
    @Transactional
    public void deleteFridge(Long id) {
        if (!fridgeRepository.existsById(id)) {
            throw new RuntimeException("Fridge not found with ID: " + id);
        }
        fridgeRepository.deleteById(id);
    }

    private CommunityFridgeDto mapToDto(CommunityFridge fridge) {
        long count = donationRepository.countAvailableFoodByFridgeId(fridge.getId());

        return CommunityFridgeDto.builder()
                .id(fridge.getId())
                .name(fridge.getName())
                .location(fridge.getLocation())
                .latitude(fridge.getLatitude())
                .longitude(fridge.getLongitude())
                .capacityKg(fridge.getCapacityKg())
                .currentOccupancyKg(fridge.getCurrentOccupancyKg())
                .status(fridge.getStatus())
                .managedByUserId(fridge.getManagedBy() != null ? fridge.getManagedBy().getId() : null)
                .managedByUserName(fridge.getManagedBy() != null ? fridge.getManagedBy().getName() : "Unassigned")
                .availableFoodCount((int) count)
                .createdAt(fridge.getCreatedAt())
                .build();
    }
}
