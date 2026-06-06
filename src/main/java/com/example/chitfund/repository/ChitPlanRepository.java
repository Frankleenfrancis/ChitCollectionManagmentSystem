package com.example.chitfund.repository;

import com.example.chitfund.entity.ChitEnrollment;
import com.example.chitfund.entity.ChitPlan;
import com.example.chitfund.enums.ChitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChitPlanRepository extends JpaRepository<ChitPlan, Long> {

    Optional<ChitPlan> findByPlanName(String planName);

    boolean existsByPlanName(String planName);

    List<ChitPlan> findByStatus(ChitStatus status);

    Page<ChitPlan> findByStatus(ChitStatus status, Pageable pageable);

    @Query("SELECT COUNT(p) FROM ChitPlan p WHERE p.status = 'ACTIVE'")
    Long countActivePlans();

    @Query("SELECT p FROM ChitPlan p WHERE SIZE(p.enrollments) < p.maxMembers AND p.status = 'ACTIVE'")
    List<ChitPlan> findAvailablePlans();

    @Query("SELECT e FROM ChitEnrollment e JOIN FETCH e.chitPlan JOIN FETCH e.customer")
    List<ChitEnrollment> findAllWithDetails();
}