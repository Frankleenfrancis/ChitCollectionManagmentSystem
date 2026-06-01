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
public class ChitPlanResponse {
    private Long id;
    private String planName;
    private BigDecimal totalAmount;
    private Integer durationMonths;
    private BigDecimal monthlyAmount;
    private Integer maxMembers;
    private Integer currentEnrollments;
    private Integer availableSlots;
    private String description;
    private ChitStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private String createdBy;
}
