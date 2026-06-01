package com.example.chitfund.dtos;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ChitPlanRequest {

    @NotBlank(message = "Plan name is required")
    private String planName;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "1000.00", message = "Total amount must be at least 1000")
    private BigDecimal totalAmount;

    @NotNull(message = "Duration in months is required")
    @Min(value = 1, message = "Duration must be at least 1 month")
    private Integer durationMonths;

    @NotNull(message = "Monthly amount is required")
    @DecimalMin(value = "100.00", message = "Monthly amount must be at least 100")
    private BigDecimal monthlyAmount;

    @NotNull(message = "Max members is required")
    @Min(value = 1, message = "At least 1 member required")
    private Integer maxMembers;

    private String description;

    private LocalDate startDate;
}