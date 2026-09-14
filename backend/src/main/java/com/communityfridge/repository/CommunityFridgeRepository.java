package com.communityfridge.repository;

import com.communityfridge.model.CommunityFridge;
import com.communityfridge.model.FridgeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityFridgeRepository extends JpaRepository<CommunityFridge, Long> {

    List<CommunityFridge> findByStatus(FridgeStatus status);

    List<CommunityFridge> findByManagedBy_Id(Long userId);
}
