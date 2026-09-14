package com.communityfridge.config;

import com.communityfridge.model.CommunityFridge;
import com.communityfridge.model.FridgeStatus;
import com.communityfridge.model.Role;
import com.communityfridge.model.User;
import com.communityfridge.repository.CommunityFridgeRepository;
import com.communityfridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CommunityFridgeRepository communityFridgeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User admin = null;
        if (userRepository.count() == 0) {
            admin = User.builder()
                    .name("System Admin")
                    .email("admin@communityfridge.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("1234567890")
                    .role(Role.ADMIN)
                    .build();

            User donor = User.builder()
                    .name("Jane Donor")
                    .email("donor@communityfridge.com")
                    .password(passwordEncoder.encode("donor123"))
                    .phone("1234567891")
                    .role(Role.DONOR)
                    .build();

            User receiver = User.builder()
                    .name("John Receiver")
                    .email("receiver@communityfridge.com")
                    .password(passwordEncoder.encode("receiver123"))
                    .phone("1234567892")
                    .role(Role.RECEIVER)
                    .build();

            User volunteer = User.builder()
                    .name("Alex Volunteer")
                    .email("volunteer@communityfridge.com")
                    .password(passwordEncoder.encode("volunteer123"))
                    .phone("1234567893")
                    .role(Role.VOLUNTEER)
                    .build();

            User ngo = User.builder()
                    .name("Hope NGO Relief")
                    .email("ngo@communityfridge.com")
                    .password(passwordEncoder.encode("ngo123"))
                    .phone("1234567894")
                    .role(Role.NGO)
                    .build();

            admin = userRepository.save(admin);
            userRepository.save(donor);
            userRepository.save(receiver);
            userRepository.save(volunteer);
            userRepository.save(ngo);
        } else {
            admin = userRepository.findByEmail("admin@communityfridge.com").orElse(null);
            if (!userRepository.existsByEmail("ngo@communityfridge.com")) {
                User ngo = User.builder()
                        .name("Hope NGO Relief")
                        .email("ngo@communityfridge.com")
                        .password(passwordEncoder.encode("ngo123"))
                        .phone("1234567894")
                        .role(Role.NGO)
                        .build();
                userRepository.save(ngo);
            }
        }

        if (communityFridgeRepository.count() == 0 && admin != null) {
            CommunityFridge fridge1 = CommunityFridge.builder()
                    .name("Downtown Community Fridge")
                    .location("123 Main St, New York, NY")
                    .latitude(40.7128)
                    .longitude(-74.0060)
                    .capacityKg(100.0)
                    .currentOccupancyKg(25.0)
                    .status(FridgeStatus.ACTIVE)
                    .managedBy(admin)
                    .build();

            CommunityFridge fridge2 = CommunityFridge.builder()
                    .name("Uptown Food Hub")
                    .location("456 Park Ave, New York, NY")
                    .latitude(40.7831)
                    .longitude(-73.9712)
                    .capacityKg(80.0)
                    .currentOccupancyKg(15.0)
                    .status(FridgeStatus.ACTIVE)
                    .managedBy(admin)
                    .build();

            CommunityFridge fridge3 = CommunityFridge.builder()
                    .name("Westside Community Pantry")
                    .location("789 Broadway, New York, NY")
                    .latitude(40.7589)
                    .longitude(-73.9851)
                    .capacityKg(120.0)
                    .currentOccupancyKg(40.0)
                    .status(FridgeStatus.ACTIVE)
                    .managedBy(admin)
                    .build();

            communityFridgeRepository.save(fridge1);
            communityFridgeRepository.save(fridge2);
            communityFridgeRepository.save(fridge3);
        }
    }
}
