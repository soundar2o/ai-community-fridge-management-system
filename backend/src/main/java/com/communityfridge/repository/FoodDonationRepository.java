package com.communityfridge.repository;

import com.communityfridge.model.DonationStatus;
import com.communityfridge.model.FoodDonation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {

    List<FoodDonation> findByDonor_IdOrderByCreatedAtDesc(Long donorId);

    List<FoodDonation> findByStatus(DonationStatus status);

    List<FoodDonation> findByStatusIn(List<DonationStatus> statuses);

    List<FoodDonation> findByFridge_IdAndStatus(Long fridgeId, DonationStatus status);

    long countByFridge_IdAndStatusIn(Long fridgeId, List<DonationStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM FoodDonation f WHERE f.id = :id")
    Optional<FoodDonation> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT COUNT(f) FROM FoodDonation f WHERE f.fridge.id = :fridgeId AND f.quantity > 0 AND f.status IN ('PENDING', 'PENDING_VERIFICATION', 'APPROVED', 'AVAILABLE') AND f.expiryDatetime > CURRENT_TIMESTAMP")
    long countAvailableFoodByFridgeId(@Param("fridgeId") Long fridgeId);

    @Query("SELECT f FROM FoodDonation f WHERE f.expiryDatetime < :now AND f.status IN ('PENDING', 'PENDING_VERIFICATION', 'APPROVED', 'AVAILABLE')")
    List<FoodDonation> findExpiredDonations(@Param("now") LocalDateTime now);

    @Query("SELECT f FROM FoodDonation f WHERE f.expiryDatetime > :now AND f.expiryDatetime <= :threshold AND f.status IN ('PENDING', 'PENDING_VERIFICATION', 'APPROVED', 'AVAILABLE') AND f.quantity > 0 ORDER BY f.expiryDatetime ASC")
    List<FoodDonation> findNearingExpiryDonations(@Param("now") LocalDateTime now, @Param("threshold") LocalDateTime threshold);

    @Query("SELECT f FROM FoodDonation f WHERE f.status IN ('PENDING', 'PENDING_VERIFICATION', 'APPROVED', 'AVAILABLE') AND f.quantity > 0 AND f.expiryDatetime > CURRENT_TIMESTAMP AND (:category IS NULL OR :category = '' OR f.category = :category) AND (:fridgeId IS NULL OR f.fridge.id = :fridgeId) AND LOWER(f.foodName) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY f.createdAt DESC")
    List<FoodDonation> searchAvailableFood(
            @Param("category") String category,
            @Param("fridgeId") Long fridgeId,
            @Param("search") String search);
}
