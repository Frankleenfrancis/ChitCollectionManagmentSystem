package com.example.chitfund.dtos.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerDashboardResponse {

    private Long customerId;
    private String customerName;
    private Integer activeChits;
    private Double totalPaid;
    private Double pendingAmount;
}