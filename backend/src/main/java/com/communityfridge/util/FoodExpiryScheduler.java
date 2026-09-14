package com.communityfridge.util;

import com.communityfridge.model.DonationStatus;
import com.communityfridge.model.FoodDonation;
import com.communityfridge.repository.FoodDonationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FoodExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(FoodExpiryScheduler.class);
    private final FoodDonationRepository donationRepository;

    @Scheduled(fixedRate = 60000) // Check every 60 seconds
    @Transactional
    public void checkAndFlagExpiredDonations() {
        LocalDateTime now = LocalDateTime.now();
        List<FoodDonation> expiredList = donationRepository.findExpiredDonations(now);

        if (!expiredList.isEmpty()) {
            log.info("Found {} food donations that have reached expiry. Flagging as EXPIRED.", expiredList.size());
            for (FoodDonation donation : expiredList) {
                donation.setStatus(DonationStatus.EXPIRED);
            }
            donationRepository.saveAll(expiredList);
        }
    }
}
