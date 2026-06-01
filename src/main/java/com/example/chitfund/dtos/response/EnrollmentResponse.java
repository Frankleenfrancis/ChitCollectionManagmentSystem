package com.example.chitfund.dtos.response;

import com.example.chitfund.enums.ChitStatus;
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
public class EnrollmentResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long chitPlanId;
    private String chitPlanName;
    private BigDecimal monthlyAmount;
    private BigDecimal totalAmount;
    private LocalDate enrollmentDate;
    private ChitStatus status;
    private BigDecimal totalPaid;
    private BigDecimal pendingAmount;
    private Integer totalMonths;
    private Integer paidMonths;
    private Integer pendingMonths;
    private LocalDateTime createdAt;
    private String assignedBy;
}