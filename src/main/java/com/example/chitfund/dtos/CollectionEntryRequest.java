package com.example.chitfund.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CollectionEntryRequest {

    @NotNull(message = "Enrollment ID is required")
    private Long enrollmentId;

    @NotNull(message = "Month number is required")
    private Integer monthNumber;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotNull(message = "Due amount is required")
    @DecimalMin(value = "1.00", message = "Due amount must be greater than 0")
    private BigDecimal dueAmount;

    private Long chitPlanId;

    private String remarks;
}