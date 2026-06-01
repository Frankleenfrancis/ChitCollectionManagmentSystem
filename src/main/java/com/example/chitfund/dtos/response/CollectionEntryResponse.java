package com.example.chitfund.dtos.response;

import com.example.chitfund.enums.PaymentStatus;
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
public class CollectionEntryResponse {
    private Long id;
    private Long enrollmentId;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long chitPlanId;
    private String chitPlanName;
    private Integer monthNumber;
    private LocalDate dueDate;
    private BigDecimal dueAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private PaymentStatus status;
    private LocalDate paymentDate;
    private String remarks;
    private String collectedBy;
    private LocalDateTime createdAt;
}