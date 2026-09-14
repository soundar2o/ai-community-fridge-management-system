package com.communityfridge.service;

import com.communityfridge.model.*;
import com.communityfridge.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import java.time.LocalDateTime;

@SpringBootTest
@ActiveProfiles("test")
public class ApproveExceptionDiagnosisTest {

    @Autowired
    private FoodRequestService foodRequestService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityFridgeRepository communityFridgeRepository;

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private FoodRequestRepository requestRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Test
    public void diagnoseApproveException() {
        TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
        Long reqId = null;
        String donorEmail = null;
        try {
            User donor = userRepository.save(User.builder()
                    .name("Test Donor")
                    .email("donor_diag@test.com")
                    .password("pass")
                    .role(Role.DONOR)
                    .build());

            User receiver = userRepository.save(User.builder()
                    .name("Test Receiver")
                    .email("receiver_diag@test.com")
                    .password("pass")
                    .role(Role.RECEIVER)
                    .build());

            CommunityFridge fridge = communityFridgeRepository.save(CommunityFridge.builder()
                    .name("Diag Fridge")
                    .location("Diag Loc")
                    .capacityKg(100.0)
                    .managedBy(donor)
                    .status(FridgeStatus.ACTIVE)
                    .build());

            FoodDonation donation = donationRepository.save(FoodDonation.builder()
                    .donor(donor)
                    .fridge(fridge)
                    .foodName("Diag Food")
                    .quantity(5)
                    .expiryDatetime(LocalDateTime.now().plusDays(2))
                    .status(DonationStatus.AVAILABLE)
                    .build());

            FoodRequest request = requestRepository.save(FoodRequest.builder()
                    .foodDonation(donation)
                    .receiver(receiver)
                    .requestedQuantity(5)
                    .status(RequestStatus.PENDING)
                    .build());

            reqId = request.getId();
            donorEmail = donor.getEmail();
            transactionManager.commit(status);
        } catch (Exception e) {
            transactionManager.rollback(status);
            throw e;
        }

        System.out.println("=== ATTEMPTING APPROVE REQUEST IN SEPARATE CALL ===");
        try {
            foodRequestService.approveRequest(reqId, donorEmail);
            System.out.println("=== APPROVE SUCCESSFUL IN TEST ===");
        } catch (Exception ex) {
            System.out.println("=== EXCEPTION CAPTURED IN TEST ===");
            System.out.println("Class: " + ex.getClass().getName());
            System.out.println("Message: " + ex.getMessage());
            Throwable cause = ex.getCause();
            int level = 1;
            while (cause != null) {
                System.out.println("Caused by [" + level + "]: (" + cause.getClass().getName() + ") " + cause.getMessage());
                if (cause instanceof jakarta.validation.ConstraintViolationException) {
                    jakarta.validation.ConstraintViolationException cve = (jakarta.validation.ConstraintViolationException) cause;
                    for (var violation : cve.getConstraintViolations()) {
                        System.out.println("Violation: property=" + violation.getPropertyPath() + ", message=" + violation.getMessage() + ", rootBean=" + violation.getRootBeanClass().getName());
                    }
                }
                cause = cause.getCause();
                level++;
            }
            ex.printStackTrace(System.out);
        }
    }
}
