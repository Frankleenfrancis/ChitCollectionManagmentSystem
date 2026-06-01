package com.example.chitfund.service.impl;

import com.example.chitfund.dtos.CollectionEntryRequest;
import com.example.chitfund.dtos.EnrollmentRequest;
import com.example.chitfund.dtos.response.CollectionEntryResponse;
import com.example.chitfund.dtos.response.EnrollmentResponse;
import com.example.chitfund.entity.*;
import com.example.chitfund.enums.ChitStatus;
import com.example.chitfund.enums.PaymentStatus;
import com.example.chitfund.exception.BusinessException;
import com.example.chitfund.exception.DuplicateDataException;
import com.example.chitfund.exception.ResourceNotFoundException;
import com.example.chitfund.repository.*;
import com.example.chitfund.service.ChitCollectionService;
import com.example.chitfund.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChitCollectionServiceImpl implements ChitCollectionService {

    private final ChitEnrollmentRepository enrollmentRepository;
    private final CollectionEntryRepository collectionEntryRepository;
    private final CustomerRepository customerRepository;
    private final ChitPlanRepository chitPlanRepository;
    private final UserRepository userRepository;

    // ======================== ENROLLMENT METHODS ========================

    @Override
    @Transactional
    public EnrollmentResponse enrollCustomer(EnrollmentRequest request, String username) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CUSTOMER + request.getCustomerId()));

        ChitPlan plan = chitPlanRepository.findById(request.getChitPlanId())
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CHIT_PLAN+ request.getChitPlanId()));

        if (plan.getStatus() != ChitStatus.ACTIVE) {
            throw new BusinessException(ApiConstants.CANNOT_ENROLL_INACTIVE_PLAN );
        }

        if (enrollmentRepository.existsByCustomerIdAndChitPlanId(request.getCustomerId(), request.getChitPlanId())) {
            throw new DuplicateDataException
                    (ApiConstants.CUSTOMER_ALREADY_EXIST_BY_PLAN);
        }

        Long currentEnrollments = enrollmentRepository.countEnrollmentsByPlan(plan.getId());
        if (currentEnrollments >= plan.getMaxMembers()) {
            throw new BusinessException(ApiConstants.CHIT_PLAN_REACHED_MAXIMUM );
        }

        User assignedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.USER_NOT_FOUND + username));

        LocalDate enrollDate = request.getEnrollmentDate() != null
                ? request.getEnrollmentDate() : LocalDate.now();

        ChitEnrollment enrollment = ChitEnrollment.builder()
                .customer(customer)
                .chitPlan(plan)
                .enrollmentDate(enrollDate)
                .status(ChitStatus.ACTIVE)
                .totalPaid(BigDecimal.ZERO)
                .pendingAmount(plan.getTotalAmount())
                .assignedBy(assignedBy)
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return mapEnrollmentToResponse(enrollment);
    }

    @Override
    public EnrollmentResponse getEnrollmentById(Long id) {
        ChitEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.ENROLLMENT+ id));
        return mapEnrollmentToResponse(enrollment);
    }

    @Override
    public List<EnrollmentResponse> getEnrollmentsByCustomer(Long customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CUSTOMER+ customerId));
        return enrollmentRepository.findByCustomerId(customerId).stream()
                .map(this::mapEnrollmentToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EnrollmentResponse> getEnrollmentsByPlan(Long planId) {
        chitPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CHIT_PLAN+ planId));
        return enrollmentRepository.findByChitPlanId(planId).stream()
                .map(this::mapEnrollmentToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<EnrollmentResponse> getAllEnrollments(Pageable pageable) {
        return enrollmentRepository.findAll(pageable).map(this::mapEnrollmentToResponse);
    }



    @Override
    @Transactional
    public CollectionEntryResponse createCollectionEntry(CollectionEntryRequest request, String username) {
        ChitEnrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.ENROLLMENT+ request.getEnrollmentId()));

        if (enrollment.getStatus() != ChitStatus.ACTIVE) {
            throw new BusinessException
                    (ApiConstants.CANNOT_ADD_INACTIVE_ENROLLMENT);

        }

        if (request.getMonthNumber() > enrollment.getChitPlan().getDurationMonths()) {
            throw new BusinessException(ApiConstants.MONTH_NO_EXCEED_PLAN_DURATION
                    + enrollment.getChitPlan().getDurationMonths() + ApiConstants.MONTHS);
        }

        boolean entryExists = collectionEntryRepository
                .findByEnrollmentIdAndMonthNumber(enrollment.getId(), request.getMonthNumber())
                .isPresent();
        if (entryExists) {
            throw new DuplicateDataException(ApiConstants.COLLECTION_ENTRY_EXISTS_BY_MONTH + request.getMonthNumber());
        }

        User collectedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.USER_NOT_FOUND + username));


        ChitPlan plan = null;
        if (request.getChitPlanId() != null) {
            plan = chitPlanRepository.findById(request.getChitPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException
                            ("Chit Plan not found with ID: " + request.getChitPlanId()));
        }

        CollectionEntry entry = CollectionEntry.builder()
                .enrollment(enrollment)
                .monthNumber(request.getMonthNumber())
                .dueDate(request.getDueDate())
                .dueAmount(request.getDueAmount())
                .paidAmount(BigDecimal.ZERO)
                .status(PaymentStatus.PENDING)
                .remarks(request.getRemarks())
                .collectedBy(collectedBy)
                .build();

            CollectionEntry saved = collectionEntryRepository.save(entry);

        if (plan != null) {

            ChitEnrollment enrollment1=ChitEnrollment.builder()
                    .chitPlan(plan)
                    .status(com.example.chitfund.enums.ChitStatus.ACTIVE)
                    .build();
        }
        return mapCollectionEntryToResponse(saved);
    }

    @Override
    public CollectionEntryResponse getCollectionEntryById(Long id) {
        CollectionEntry entry = collectionEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.COLLECTION_ENTRY + id));
        return mapCollectionEntryToResponse(entry);
    }

    @Override
    public List<CollectionEntryResponse> getCollectionHistoryByEnrollment(Long enrollmentId) {
        enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.ENROLLMENT_ID_NOT_FOUND+ enrollmentId));
        return collectionEntryRepository.findByEnrollmentIdOrderByMonthNumberAsc(enrollmentId).stream()
                .map(this::mapCollectionEntryToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CollectionEntryResponse> getCollectionHistoryByCustomer(Long customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CUSTOMER_ID_NOT_FOUND+ customerId));
        return collectionEntryRepository.findByCustomerId(customerId).stream()
                .map(this::mapCollectionEntryToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CollectionEntryResponse> getPendingCollections(Long customerId) {
        List< CollectionEntryResponse> collectionEntryList = collectionEntryRepository
                .findByCustomerIdAndStatus(customerId, PaymentStatus.PENDING).stream()
                .map(this::mapCollectionEntryToResponse)
                .toList();

        if(collectionEntryList.isEmpty()){
            throw new ResourceNotFoundException(ApiConstants.CUSTOMER_ID_PENDING_STATUS_NOT_FOUND);
        }

        return collectionEntryList;

    }

    @Override
    public List<CollectionEntryResponse> getOverdueCollections() {
        return collectionEntryRepository.findOverdueEntries(LocalDate.now()).stream()
                .map(this::mapCollectionEntryToResponse)
                .collect(Collectors.toList());
    }

    // ======================== MAPPING HELPERS ========================

    private EnrollmentResponse mapEnrollmentToResponse(ChitEnrollment enrollment) {
        ChitPlan plan = enrollment.getChitPlan();
        Customer customer = enrollment.getCustomer();

        List<CollectionEntry> entries = collectionEntryRepository
                .findByEnrollmentIdOrderByMonthNumberAsc(enrollment.getId());

        long paidMonths = entries.stream()
                .filter(e -> e.getStatus() == PaymentStatus.PAID).count();
        long pendingMonths = entries.stream()
                .filter(e -> e.getStatus() == PaymentStatus.PENDING
                        || e.getStatus() == PaymentStatus.PARTIAL).count();

        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .customerId(customer.getId())
                .customerName(customer.getFullName())
                .customerPhone(customer.getPhone())
                .chitPlanId(plan.getId())
                .chitPlanName(plan.getPlanName())
                .monthlyAmount(plan.getMonthlyAmount())
                .totalAmount(plan.getTotalAmount())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .totalPaid(enrollment.getTotalPaid())
                .pendingAmount(enrollment.getPendingAmount())
                .totalMonths(plan.getDurationMonths())
                .paidMonths((int) paidMonths)
                .pendingMonths((int) pendingMonths)
                .createdAt(enrollment.getCreatedAt())
                .assignedBy(enrollment.getAssignedBy() != null
                        ? enrollment.getAssignedBy().getFullName() : null)
                .build();
    }

    private CollectionEntryResponse mapCollectionEntryToResponse(CollectionEntry entry) {
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
                .collectedBy(entry.getCollectedBy() != null
                        ? entry.getCollectedBy().getFullName() : null)
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
