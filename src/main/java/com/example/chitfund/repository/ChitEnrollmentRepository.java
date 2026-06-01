package com.example.chitfund.repository;

import com.example.chitfund.entity.ChitEnrollment;
import com.example.chitfund.enums.ChitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChitEnrollmentRepository extends JpaRepository<ChitEnrollment, Long> {

    List<ChitEnrollment> findByCustomerId(Long customerId);

    List<ChitEnrollment> findByChitPlanId(Long chitPlanId);

    Optional<ChitEnrollment> findByCustomerIdAndChitPlanId(Long customerId, Long chitPlanId);

    boolean existsByCustomerIdAndChitPlanId(Long customerId, Long chitPlanId);

    Page<ChitEnrollment> findByStatus(ChitStatus status, Pageable pageable);

    @Query("SELECT COUNT(e) FROM ChitEnrollment e WHERE e.chitPlan.id = :planId AND e.status = 'ACTIVE'")
    Long countEnrollmentsByPlan(@Param("planId") Long planId);

    @Query("SELECT SUM(e.pendingAmount) FROM ChitEnrollment e WHERE e.customer.id = :customerId")
    java.math.BigDecimal getTotalPendingByCustomer(@Param("customerId") Long customerId);

    @Query("SELECT SUM(e.totalPaid) FROM ChitEnrollment e WHERE e.customer.id = :customerId")
    java.math.BigDecimal getTotalPaidByCustomer(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(e.totalPaid), 0) FROM ChitEnrollment e WHERE e.customer.id = :customerId")
    Double getTotalPaid(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(e.pendingAmount), 0) FROM ChitEnrollment e WHERE e.customer.id = :customerId")
    Double getPendingAmount(@Param("customerId") Long customerId);

    @Query("SELECT COUNT(e) FROM ChitEnrollment e WHERE e.customer.id = :customerId AND e.status = com.example.chitfund.enums.ChitStatus.ACTIVE")
    Integer countActiveChits(@Param("customerId") Long customerId);
}       