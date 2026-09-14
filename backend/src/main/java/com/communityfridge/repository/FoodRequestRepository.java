package com.communityfridge.repository;

import com.communityfridge.model.FoodRequest;
import com.communityfridge.model.RequestStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRequestRepository extends JpaRepository<FoodRequest, Long> {

    @EntityGraph(attributePaths = {"foodDonation", "foodDonation.fridge", "foodDonation.donor", "receiver"})
    List<FoodRequest> findByReceiver_IdOrderByCreatedAtDesc(Long receiverId);

    @EntityGraph(attributePaths = {"foodDonation", "foodDonation.fridge", "foodDonation.donor", "receiver"})
    List<FoodRequest> findByFoodDonation_Id(Long donationId);

    @EntityGraph(attributePaths = {"foodDonation", "foodDonation.fridge", "foodDonation.donor", "receiver"})
    List<FoodRequest> findByFoodDonation_Donor_IdOrderByCreatedAtDesc(Long donorId);

    @EntityGraph(attributePaths = {"foodDonation", "foodDonation.fridge", "foodDonation.donor", "receiver"})
    List<FoodRequest> findAll();

    boolean existsByFoodDonation_IdAndReceiver_IdAndStatusIn(Long donationId, Long receiverId, List<RequestStatus> statuses);

    List<FoodRequest> findByReceiver_IdAndStatusIn(Long receiverId, List<RequestStatus> statuses);

    @EntityGraph(attributePaths = {"foodDonation", "foodDonation.fridge", "foodDonation.donor", "receiver"})
    List<FoodRequest> findTop30ByOrderByCreatedAtDesc();
}
