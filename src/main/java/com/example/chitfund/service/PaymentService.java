package com.example.chitfund.service;

import com.example.chitfund.dtos.PaymentRequest;
import com.example.chitfund.dtos.response.PaymentReceiptResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface PaymentService {
    PaymentReceiptResponse recordPayment(PaymentRequest request, String username);
    PaymentReceiptResponse getReceiptByNumber(String receiptNumber);
    PaymentReceiptResponse getReceiptById(Long paymentId);
    Page<PaymentReceiptResponse> getPaymentsByCustomer(Long customerId, Pageable pageable);
    List<PaymentReceiptResponse> getPaymentsByDateRange(LocalDate start, LocalDate end);
}