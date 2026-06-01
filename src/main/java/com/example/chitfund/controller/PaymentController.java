package com.example.chitfund.controller;

import com.example.chitfund.dtos.PaymentRequest;
import com.example.chitfund.dtos.response.ApiResponse;
import com.example.chitfund.dtos.response.PaymentReceiptResponse;
import com.example.chitfund.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;


    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<PaymentReceiptResponse>> recordPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        PaymentReceiptResponse receipt = paymentService.recordPayment(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment recorded successfully", receipt));
    }


    @GetMapping("/receipt/{receiptNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<PaymentReceiptResponse>> getReceiptByNumber(
            @PathVariable String receiptNumber) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getReceiptByNumber(receiptNumber)));
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<PaymentReceiptResponse>> getReceiptById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getReceiptById(id)));
    }


    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Page<PaymentReceiptResponse>>> getPaymentsByCustomer(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getPaymentsByCustomer(customerId, pageable)));
    }


    @GetMapping("/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentReceiptResponse>>> getPaymentReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<PaymentReceiptResponse> report = paymentService.getPaymentsByDateRange(start, end);
        return ResponseEntity.ok(ApiResponse.success(
                "Collection report from " + start + " to " + end, report));
    }
}
