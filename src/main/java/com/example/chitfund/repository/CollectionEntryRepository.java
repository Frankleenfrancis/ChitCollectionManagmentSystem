package com.example.chitfund.repository;

import com.example.chitfund.entity.CollectionEntry;
import com.example.chitfund.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionEntryRepository extends JpaRepository<CollectionEntry, Long> {

    List<CollectionEntry> findByEnrollmentId(Long enrollmentId);

    List<CollectionEntry> findByEnrollmentIdOrderByMonthNumberAsc(Long enrollmentId);

    Optional<CollectionEntry> findByEnrollmentIdAndMonthNumber(Long enrollmentId, Integer monthNumber);

    List<CollectionEntry> findByStatus(PaymentStatus status);

    Page<CollectionEntry> findByStatus(PaymentStatus status, Pageable pageable);

    @Query("SELECT ce FROM CollectionEntry ce WHERE ce.enrollment.customer.id = :customerId ORDER BY ce.dueDate DESC")
    List<CollectionEntry> findByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT ce FROM CollectionEntry ce WHERE ce.enrollment.customer.id = :customerId AND ce.status = :status")
    List<CollectionEntry> findByCustomerIdAndStatus(@Param("customerId") Long customerId,
                                                    @Param("status") PaymentStatus status);

    @Query("SELECT SUM(ce.dueAmount - ce.paidAmount) FROM CollectionEntry ce WHERE ce.status = 'PENDING' OR ce.status = 'PARTIAL'")
    BigDecimal getTotalPendingAmount();

    @Query("SELECT SUM(ce.paidAmount) FROM CollectionEntry ce WHERE ce.status = 'PAID'")
    BigDecimal getTotalCollectedAmount();

    @Query("SELECT SUM(ce.paidAmount) FROM CollectionEntry ce WHERE ce.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal getCollectionBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(ce) FROM CollectionEntry ce WHERE ce.dueDate < :today AND (ce.status = 'PENDING' OR ce.status = 'PARTIAL')")
    Long countOverdueEntries(@Param("today") LocalDate today);

    @Query("SELECT ce FROM CollectionEntry ce WHERE ce.dueDate < :today AND (ce.status = 'PENDING' OR ce.status = 'PARTIAL')")
    List<CollectionEntry> findOverdueEntries(@Param("today") LocalDate today);
}