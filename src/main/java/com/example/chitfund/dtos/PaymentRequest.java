package com.example.chitfund.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {

    @NotNull(message = "Collection Entry ID is required")
    private Long collectionEntryId;

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "1.00", message = "Amount paid must be greater than 0")
    private BigDecimal amountPaid;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    private String paymentMode;

    private String transactionReference;

    private String remarks;
}
