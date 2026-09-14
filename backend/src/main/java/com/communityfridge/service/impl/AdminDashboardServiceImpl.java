package com.communityfridge.service.impl;

import com.communityfridge.dto.DashboardStatsDto;
import com.communityfridge.dto.UserDto;
import com.communityfridge.model.DonationStatus;
import com.communityfridge.model.FridgeStatus;
import com.communityfridge.model.Role;
import com.communityfridge.model.User;
import com.communityfridge.repository.CommunityFridgeRepository;
import com.communityfridge.repository.FoodDonationRepository;
import com.communityfridge.repository.UserRepository;
import com.communityfridge.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final CommunityFridgeRepository fridgeRepository;
    private final FoodDonationRepository donationRepository;

    @Override
    public DashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalFridges = fridgeRepository.count();
        long activeFridges = fridgeRepository.findByStatus(FridgeStatus.ACTIVE).size();
        long totalDonations = donationRepository.count();

        long completedCollections = donationRepository.findByStatus(DonationStatus.COLLECTED).size();
        long expiredDonations = donationRepository.findByStatus(DonationStatus.EXPIRED).size();

        // User breakdown map
        Map<String, Long> usersByRole = new HashMap<>();
        for (Role r : Role.values()) {
            usersByRole.put(r.name(), userRepository.findAll().stream().filter(u -> u.getRole() == r).count());
        }

        // Donation status map
        Map<String, Long> donationsByStatus = new HashMap<>();
        for (DonationStatus s : DonationStatus.values()) {
            donationsByStatus.put(s.name(), donationRepository.findByStatus(s).size() * 1L);
        }

        return DashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .totalFridges(totalFridges)
                .activeFridges(activeFridges)
                .totalDonations(totalDonations)
                .totalSavedMeals(completedCollections)
                .completedCollections(completedCollections)
                .expiredDonations(expiredDonations)
                .usersByRole(usersByRole)
                .donationsByStatus(donationsByStatus)
                .build();
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        User updated = userRepository.save(user);
        return mapToUserDto(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
