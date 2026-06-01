package com.example.chitfund.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EnrollmentRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Chit Plan ID is required")
    private Long chitPlanId;

    private LocalDate enrollmentDate;
}