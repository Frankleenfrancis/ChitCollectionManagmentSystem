package com.example.chitfund.dtos.response;

import com.example.chitfund.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentReceiptResponse {



    private String receiptNumber;
    private LocalDate paymentDate;
    private LocalDateTime generatedAt;


    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String customerAddress;


    private Long chitPlanId;
    private String chitPlanName;
    private Long enrollmentId;


    private Integer monthNumber;
    private LocalDate dueDate;
    private BigDecimal dueAmount;
    private BigDecimal amountPaid;
    private BigDecimal balanceAmount;
    private String paymentMode;
    private String transactionReference;
    private PaymentStatus status;


    private BigDecimal totalPaidTillDate;
    private BigDecimal totalPendingAmount;


    private String recordedBy;
    private String remarks;
}