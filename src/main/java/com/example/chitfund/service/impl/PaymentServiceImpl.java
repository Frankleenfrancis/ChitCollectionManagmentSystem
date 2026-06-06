package com.example.chitfund.service.impl;

import com.example.chitfund.dtos.PaymentRequest;
import com.example.chitfund.dtos.response.PaymentReceiptResponse;
import com.example.chitfund.entity.*;
import com.example.chitfund.enums.PaymentStatus;
import com.example.chitfund.exception.BusinessException;
import com.example.chitfund.exception.ResourceNotFoundException;
import com.example.chitfund.repository.ChitEnrollmentRepository;
import com.example.chitfund.repository.CollectionEntryRepository;
import com.example.chitfund.repository.PaymentRepository;
import com.example.chitfund.repository.UserRepository;
import com.example.chitfund.service.PaymentService;
import com.example.chitfund.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final CollectionEntryRepository collectionEntryRepository;
    private final ChitEnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PaymentReceiptResponse recordPayment(PaymentRequest request, String username) {
        CollectionEntry entry = collectionEntryRepository.findById(request.getCollectionEntryId())
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.COLLECTION_ENTRY_BY_ID_NOT_FOUND + request.getCollectionEntryId()));

        if (entry.getStatus() == PaymentStatus.PAID) {
            throw new BusinessException(ApiConstants.COLLECTION_ENTRY_FULLY_PAID);
        }

        BigDecimal remaining = entry.getDueAmount().subtract(entry.getPaidAmount());
        if (request.getAmountPaid().compareTo(remaining) > 0) {
            throw new BusinessException("Amount paid (" + request.getAmountPaid()
                    + ") exceeds balance due (" + remaining + ")");
        }

        User recordedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.USER_NOT_FOUND+ username));


        String receiptNumber = generateReceiptNumber();
        while (paymentRepository.existsByReceiptNumber(receiptNumber)) {
            receiptNumber = generateReceiptNumber();
        }

        BigDecimal currentPaid = entry.getPaidAmount() == null
                ? BigDecimal.ZERO
                : entry.getPaidAmount();

        BigDecimal newPaidAmount = currentPaid.add(request.getAmountPaid());

        PaymentStatus newStatus = newPaidAmount.compareTo(entry.getDueAmount()) >= 0
                ? PaymentStatus.PAID
                : PaymentStatus.PARTIAL;


        Payment payment = Payment.builder()
                .receiptNumber(receiptNumber)
                .collectionEntry(entry)
                .customer(entry.getEnrollment().getCustomer())
                .amountPaid(request.getAmountPaid())
                .status(newStatus)
                .paymentDate(request.getPaymentDate())
                .paymentMode(request.getPaymentMode())
                .transactionReference(request.getTransactionReference())
                .remarks(request.getRemarks())
                .recordedBy(recordedBy)
                .build();
        payment = paymentRepository.save(payment);


        entry.setPaidAmount(newPaidAmount);
        entry.setStatus(newStatus);
        entry.setPaymentDate(request.getPaymentDate());
        entry.setRemarks(request.getRemarks());
        collectionEntryRepository.save(entry);


        ChitEnrollment enrollment = entry.getEnrollment();
        BigDecimal updatedTotalPaid = enrollment.getTotalPaid().add(request.getAmountPaid());
        BigDecimal updatedPending = enrollment.getPendingAmount().subtract(request.getAmountPaid());
        enrollment.setTotalPaid(updatedTotalPaid);
        enrollment.setPendingAmount(updatedPending.compareTo(BigDecimal.ZERO) < 0
                ? BigDecimal.ZERO : updatedPending);
        enrollmentRepository.save(enrollment);

        return buildReceiptResponse(payment, entry, enrollment);
    }

    @Override
    public PaymentReceiptResponse getReceiptByNumber(String receiptNumber) {
        Payment payment = paymentRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.PAYMENT_NOT_FOUND_WITH_RECEIPT + receiptNumber));
        return buildReceiptResponse(payment, payment.getCollectionEntry(), payment.getCollectionEntry().getEnrollment());
    }

    @Override
    public PaymentReceiptResponse getReceiptById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.PAYMENT_ID_NOT_FOUND+ paymentId));
        return buildReceiptResponse(payment, payment.getCollectionEntry(), payment.getCollectionEntry().getEnrollment());
    }

    @Override
    public Page<PaymentReceiptResponse> getPaymentsByCustomer(Long customerId, Pageable pageable) {
        return paymentRepository.findByCustomerId(customerId, pageable)
                .map(p -> buildReceiptResponse(p, p.getCollectionEntry(), p.getCollectionEntry().getEnrollment()));
    }

    @Override
    public List<PaymentReceiptResponse> getPaymentsByDateRange(LocalDate start, LocalDate end) {
        return paymentRepository.findByPaymentDateBetweenOrderByPaymentDateDesc(start, end).stream()
                .map(p -> buildReceiptResponse(p, p.getCollectionEntry(), p.getCollectionEntry().getEnrollment()))
                .collect(Collectors.toList());
    }



    private String generateReceiptNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "RCP-" + datePart + "-" + randomPart;
    }

    private PaymentReceiptResponse buildReceiptResponse(Payment payment,
                                                        CollectionEntry entry,
                                                        ChitEnrollment enrollment) {
        Customer customer = enrollment.getCustomer();
        ChitPlan plan = enrollment.getChitPlan();

        BigDecimal balance = entry.getDueAmount().subtract(entry.getPaidAmount());

        return PaymentReceiptResponse.builder()
                .receiptNumber(payment.getReceiptNumber())
                .paymentDate(payment.getPaymentDate())
                .generatedAt(LocalDateTime.now())
                // Customer
                .customerId(customer.getId())
                .customerName(customer.getFullName())
                .customerPhone(customer.getPhone())
                .customerAddress(customer.getAddress())
                // Chit Plan
                .chitPlanId(plan.getId())
                .chitPlanName(plan.getPlanName())
                .enrollmentId(enrollment.getId())
                // Payment details
                .monthNumber(entry.getMonthNumber())
                .dueDate(entry.getDueDate())
                .dueAmount(entry.getDueAmount())
                .amountPaid(payment.getAmountPaid())
                .balanceAmount(balance.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : balance)
                .paymentMode(payment.getPaymentMode())
                .transactionReference(payment.getTransactionReference())
                .status(entry.getStatus())
                // Cumulative
                .totalPaidTillDate(enrollment.getTotalPaid())
                .totalPendingAmount(enrollment.getPendingAmount())
                // Agent
                .recordedBy(payment.getRecordedBy() != null ? payment.getRecordedBy().getFullName() : null)
                .remarks(payment.getRemarks())
                .build();
    }
}