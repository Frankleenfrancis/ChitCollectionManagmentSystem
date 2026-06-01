package com.example.chitfund.repository;

import com.example.chitfund.entity.Payment;
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
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByReceiptNumber(String receiptNumber);

    boolean existsByReceiptNumber(String receiptNumber);

    List<Payment> findByCustomerId(Long customerId);

    Page<Payment> findByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT SUM(p.amountPaid) FROM Payment p")
    BigDecimal getTotalCollected();

    @Query("SELECT SUM(p.amountPaid) FROM Payment p WHERE p.paymentDate BETWEEN :start AND :end")
    BigDecimal getCollectedBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(p.amountPaid) FROM Payment p WHERE p.paymentDate = :today")
    BigDecimal getTodayCollection(@Param("today") LocalDate today);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentDate BETWEEN :start AND :end")
    Long countPaymentsBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    List<Payment> findByPaymentDateBetweenOrderByPaymentDateDesc(LocalDate start, LocalDate end);
}
