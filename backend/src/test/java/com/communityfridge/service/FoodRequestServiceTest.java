package com.communityfridge.service;

import com.communityfridge.dto.CreateFoodRequest;
import com.communityfridge.dto.FoodRequestDto;
import com.communityfridge.model.*;
import com.communityfridge.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class FoodRequestServiceTest {

    @Autowired
    private FoodRequestService foodRequestService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityFridgeRepository fridgeRepository;

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private FoodRequestRepository requestRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private User donor;
    private User receiver;
    private CommunityFridge fridge;
    private FoodDonation donation;

    @BeforeEach
    void setUp() {
        requestRepository.deleteAll();
        notificationRepository.deleteAll();
        donationRepository.deleteAll();
        fridgeRepository.deleteAll();
        userRepository.deleteAll();

        donor = userRepository.save(User.builder()
                .name("Jane Donor")
                .email("donor@test.com")
                .password("password")
                .role(Role.DONOR)
                .build());

        receiver = userRepository.save(User.builder()
                .name("John Receiver")
                .email("receiver@test.com")
                .password("password")
                .role(Role.RECEIVER)
                .build());

        fridge = fridgeRepository.save(CommunityFridge.builder()
                .name("Downtown Community Fridge")
                .location("123 Main St")
                .capacityKg(100.0)
                .status(FridgeStatus.ACTIVE)
                .build());

        donation = donationRepository.save(FoodDonation.builder()
                .donor(donor)
                .fridge(fridge)
                .foodName("Fresh Apples")
                .category("Fruits")
                .quantity(10)
                .unit("items")
                .expiryDatetime(LocalDateTime.now().plusDays(5))
                .status(DonationStatus.APPROVED)
                .build());
    }

    @Test
    void testFullFoodRequestWorkflow() {
        // 1. Receiver creates request
        CreateFoodRequest createReq = new CreateFoodRequest();
        createReq.setDonationId(donation.getId());
        createReq.setRequestedQuantity(4);

        FoodRequestDto createdDto = foodRequestService.createRequest(createReq, receiver.getEmail());
        assertNotNull(createdDto.getId());
        assertEquals(RequestStatus.PENDING, createdDto.getStatus());
        assertEquals(4, createdDto.getRequestedQuantity());

        // Verify donor notification is created
        List<Notification> donorNotifs = notificationRepository.findByUser_IdOrderByCreatedAtDesc(donor.getId());
        assertEquals(1, donorNotifs.size());
        assertEquals("New Food Request Received", donorNotifs.get(0).getTitle());
        assertFalse(donorNotifs.get(0).getIsRead());

        // 2. Donor sees request
        List<FoodRequestDto> donorRequests = foodRequestService.getRequestsForDonor(donor.getEmail());
        assertEquals(1, donorRequests.size());
        assertEquals("Fresh Apples", donorRequests.get(0).getFoodName());

        // 3. Donor approves request
        FoodRequestDto approvedDto = foodRequestService.approveRequest(createdDto.getId(), donor.getEmail());
        assertEquals(RequestStatus.APPROVED, approvedDto.getStatus());

        // Verify donation quantity correctly reduced (10 - 4 = 6)
        FoodDonation updatedDonation = donationRepository.findById(donation.getId()).orElseThrow();
        assertEquals(6, updatedDonation.getQuantity());

        // Verify receiver notification is created
        List<Notification> receiverNotifs = notificationRepository.findByUser_IdOrderByCreatedAtDesc(receiver.getId());
        assertEquals(1, receiverNotifs.size());
        assertEquals("Food Request Approved", receiverNotifs.get(0).getTitle());
        assertFalse(receiverNotifs.get(0).getIsRead());

        // 4. Test notification unread/read state
        Notification receiverNotif = receiverNotifs.get(0);
        receiverNotif.setIsRead(true);
        notificationRepository.save(receiverNotif);
        assertTrue(notificationRepository.findById(receiverNotif.getId()).orElseThrow().getIsRead());

        // 5. Test zero-stock behavior: request remaining 6 items to reduce stock to 0
        User receiver2 = userRepository.save(User.builder()
                .name("Alice Receiver")
                .email("alice@test.com")
                .password("password")
                .role(Role.RECEIVER)
                .build());

        CreateFoodRequest req2 = new CreateFoodRequest();
        req2.setDonationId(donation.getId());
        req2.setRequestedQuantity(6);

        FoodRequestDto createdDto2 = foodRequestService.createRequest(req2, receiver2.getEmail());
        foodRequestService.approveRequest(createdDto2.getId(), donor.getEmail());

        FoodDonation zeroStockDonation = donationRepository.findById(donation.getId()).orElseThrow();
        assertEquals(0, zeroStockDonation.getQuantity());
        assertEquals(DonationStatus.COLLECTED, zeroStockDonation.getStatus());

        // 6. Test donor rejects request on a new donation
        FoodDonation newDonation = donationRepository.save(FoodDonation.builder()
                .donor(donor)
                .fridge(fridge)
                .foodName("Oranges")
                .category("Fruits")
                .quantity(5)
                .unit("items")
                .expiryDatetime(LocalDateTime.now().plusDays(3))
                .status(DonationStatus.APPROVED)
                .build());

        CreateFoodRequest req3 = new CreateFoodRequest();
        req3.setDonationId(newDonation.getId());
        req3.setRequestedQuantity(2);

        FoodRequestDto createdDto3 = foodRequestService.createRequest(req3, receiver.getEmail());
        FoodRequestDto rejectedDto = foodRequestService.rejectRequest(createdDto3.getId(), donor.getEmail());

        assertEquals(RequestStatus.REJECTED, rejectedDto.getStatus());
        // Verify rejected notification created
        List<Notification> updatedReceiverNotifs = notificationRepository.findByUser_IdOrderByCreatedAtDesc(receiver.getId());
        assertTrue(updatedReceiverNotifs.stream().anyMatch(n -> "Food Request Rejected".equals(n.getTitle())));
    }
}
