package com.example.chitfund.service.impl;

import com.example.chitfund.dtos.response.CollectionEntryResponse;
import com.example.chitfund.dtos.response.CustomerDashboardResponse;
import com.example.chitfund.dtos.response.DashboardResponse;
import com.example.chitfund.dtos.response.PaymentReceiptResponse;
import com.example.chitfund.entity.*;
import com.example.chitfund.enums.ChitStatus;
import com.example.chitfund.repository.*;
import com.example.chitfund.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final CustomerRepository customerRepository;
    private final ChitPlanRepository chitPlanRepository;
    private final ChitEnrollmentRepository enrollmentRepository;
    private final CollectionEntryRepository collectionEntryRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public DashboardResponse getDashboardReport() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        // Counts
        Long totalCustomers = customerRepository.countActiveCustomers();
        Long activeChitPlans = chitPlanRepository.countActivePlans();
        Long totalEnrollments = enrollmentRepository.count();
        Long overdueEntries = collectionEntryRepository.countOverdueEntries(today);
        Long totalPlans = chitPlanRepository.count();
        Long completedPlans = (long) chitPlanRepository.findByStatus(ChitStatus.COMPLETED).size();
        Long totalPayments = paymentRepository.count();
        Long todayPayments = paymentRepository.countPaymentsBetween(today, today);

        // Financial
        BigDecimal totalCollected = nvl(paymentRepository.getTotalCollected());
        BigDecimal totalPending = nvl(collectionEntryRepository.getTotalPendingAmount());
        BigDecimal todayCollection = nvl(paymentRepository.getTodayCollection(today));
        BigDecimal monthlyCollection = nvl(paymentRepository.getCollectedBetween(monthStart, monthEnd));

        // Recent Payments (last 10)
        List<PaymentReceiptResponse> recentPayments = paymentRepository
                .findByPaymentDateBetweenOrderByPaymentDateDesc(today.minusDays(30), today)
                .stream()
                .limit(10)
                .map(this::buildReceiptSummary)
                .collect(Collectors.toList());

        // Overdue collections (top 10)
        List<CollectionEntryResponse> overdueCollections = collectionEntryRepository
                .findOverdueEntries(today)
                .stream()
                .limit(10)
                .map(this::mapEntryToResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalCustomers(totalCustomers)
                .activeChitPlans(activeChitPlans)
                .totalEnrollments(totalEnrollments)
                .overdueEntries(overdueEntries)
                .totalCollected(totalCollected)
                .totalPending(totalPending)
                .todayCollection(todayCollection)
                .monthlyCollection(monthlyCollection)
                .totalPlans(totalPlans)
                .completedPlans(completedPlans)
                .totalPayments(totalPayments)
                .todayPayments(todayPayments)
                .recentPayments(recentPayments)
                .overdueCollections(overdueCollections)
                .build();
    }



    private BigDecimal nvl(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private PaymentReceiptResponse buildReceiptSummary(Payment p) {
        CollectionEntry entry = p.getCollectionEntry();
        ChitEnrollment enrollment = entry.getEnrollment();
        Customer customer = enrollment.getCustomer();
        ChitPlan plan = enrollment.getChitPlan();

        return PaymentReceiptResponse.builder()
                .receiptNumber(p.getReceiptNumber())
                .paymentDate(p.getPaymentDate())
                .generatedAt(LocalDateTime.now())
                .customerId(customer.getId())
                .customerName(customer.getFullName())
                .customerPhone(customer.getPhone())
                .chitPlanId(plan.getId())
                .chitPlanName(plan.getPlanName())
                .enrollmentId(enrollment.getId())
                .monthNumber(entry.getMonthNumber())
                .amountPaid(p.getAmountPaid())
                .paymentMode(p.getPaymentMode())
                .status(entry.getStatus())
                .recordedBy(p.getRecordedBy() != null ? p.getRecordedBy().getFullName() : null)
                .build();
    }

    private CollectionEntryResponse mapEntryToResponse(CollectionEntry entry) {
        ChitEnrollment enrollment = entry.getEnrollment();
        Customer customer = enrollment.getCustomer();
        ChitPlan plan = enrollment.getChitPlan();
        BigDecimal balance = entry.getDueAmount().subtract(entry.getPaidAmount());

        return CollectionEntryResponse.builder()
                .id(entry.getId())
                .enrollmentId(enrollment.getId())
                .customerId(customer.getId())
                .customerName(customer.getFullName())
                .customerPhone(customer.getPhone())
                .chitPlanId(plan.getId())
                .chitPlanName(plan.getPlanName())
                .monthNumber(entry.getMonthNumber())
                .dueDate(entry.getDueDate())
                .dueAmount(entry.getDueAmount())
                .paidAmount(entry.getPaidAmount())
                .balanceAmount(balance.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : balance)
                .status(entry.getStatus())
                .paymentDate(entry.getPaymentDate())
                .remarks(entry.getRemarks())
                .createdAt(entry.getCreatedAt())
                .build();
    }

    @Override
    public CustomerDashboardResponse getDashboard(Long customerId) {
        Customer customer =
                customerRepository.findById(customerId)
                        .orElseThrow();

        Double totalPaid =
                enrollmentRepository.getTotalPaid(customerId);

        Double pending =
                enrollmentRepository.getPendingAmount(customerId);

        Integer activeChits =
                enrollmentRepository.countActiveChits(customerId);

        return CustomerDashboardResponse.builder()
                .customerId(customer.getId())
                .customerName(customer.getFullName())
                .activeChits(activeChits)
                .totalPaid(totalPaid)
                .pendingAmount(pending)
                .build();
    }
}
