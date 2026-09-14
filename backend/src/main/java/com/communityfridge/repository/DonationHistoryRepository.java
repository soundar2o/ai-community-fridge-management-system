package com.communityfridge.repository;

import com.communityfridge.model.DonationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationHistoryRepository extends JpaRepository<DonationHistory, Long> {

    List<DonationHistory> findByFoodDonation_IdOrderByTimestampDesc(Long foodDonationId);
}
