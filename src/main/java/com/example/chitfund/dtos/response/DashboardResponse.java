package com.example.chitfund.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {


    private Long totalCustomers;
    private Long activeChitPlans;
    private Long totalEnrollments;
    private Long overdueEntries;


    private BigDecimal totalCollected;
    private BigDecimal totalPending;
    private BigDecimal todayCollection;
    private BigDecimal monthlyCollection;


    private Long totalPlans;
    private Long completedPlans;


    private Long totalPayments;
    private Long todayPayments;


    private List<PaymentReceiptResponse> recentPayments;


    private List<CollectionEntryResponse> overdueCollections;
}