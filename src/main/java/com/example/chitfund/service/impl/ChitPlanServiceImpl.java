package com.example.chitfund.service.impl;

import com.example.chitfund.dtos.ChitPlanRequest;
import com.example.chitfund.dtos.response.ChitPlanResponse;
import com.example.chitfund.entity.ChitPlan;
import com.example.chitfund.entity.User;
import com.example.chitfund.enums.ChitStatus;
import com.example.chitfund.exception.DuplicateDataException;
import com.example.chitfund.exception.ResourceNotFoundException;
import com.example.chitfund.repository.ChitEnrollmentRepository;
import com.example.chitfund.repository.ChitPlanRepository;
import com.example.chitfund.repository.UserRepository;
import com.example.chitfund.service.ChitPlanService;
import com.example.chitfund.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChitPlanServiceImpl implements ChitPlanService {

    private final ChitPlanRepository chitPlanRepository;
    private final UserRepository userRepository;
    private final ChitEnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public ChitPlanResponse createPlan(ChitPlanRequest request, String username) {
        if (chitPlanRepository.existsByPlanName(request.getPlanName())) {
            throw new DuplicateDataException(ApiConstants.CHIT_PLAN_ALREADY_EXIST + request.getPlanName());
        }

        User createdBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.USER_NOT_FOUND + username));

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate = startDate.plusMonths(request.getDurationMonths());

        BigDecimal processedMonthlyAmount = request.getMonthlyAmount() != null ?
                request.getMonthlyAmount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal processedTotalAmount = request.getTotalAmount() != null ?
                request.getTotalAmount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        ChitPlan plan = ChitPlan.builder()
                .planName(request.getPlanName())
                .totalAmount(request.getTotalAmount())
                .durationMonths(request.getDurationMonths())
                .monthlyAmount(request.getMonthlyAmount())
                .maxMembers(request.getMaxMembers())
                .description(request.getDescription())
                .status(ChitStatus.ACTIVE)
                .startDate(startDate)
                .endDate(endDate)
                .createdBy(createdBy)
                .build();

        plan = chitPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public ChitPlanResponse updatePlan(Long id, ChitPlanRequest request) {
        ChitPlan plan = chitPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CHIT_PLAN + id));

        if (!plan.getPlanName().equalsIgnoreCase(request.getPlanName())
                && chitPlanRepository.existsByPlanName(request.getPlanName())) {
            throw new DuplicateDataException(ApiConstants.PLAN_NAME_ALREADY_EXIST + request.getPlanName());
        }

        // Apply clean decimal precision formats before updating
        BigDecimal processedMonthlyAmount = request.getMonthlyAmount() != null ?
                request.getMonthlyAmount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal processedTotalAmount = request.getTotalAmount() != null ?
                request.getTotalAmount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        plan.setPlanName(request.getPlanName().trim());
        plan.setTotalAmount(processedTotalAmount);
        plan.setDurationMonths(request.getDurationMonths());
        plan.setMonthlyAmount(processedMonthlyAmount);
        plan.setMaxMembers(request.getMaxMembers());
        plan.setDescription(request.getDescription());
        plan.setUpdatedAt(LocalDateTime.now()); // Keep tracked instance timestamp fresh

        // FIXED: Recalculate the end date if the start date or duration has shifted
        if (plan.getStartDate() != null) {
            plan.setEndDate(plan.getStartDate().plusMonths(request.getDurationMonths()));
        }

        plan = chitPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    @Override
    public ChitPlanResponse getPlanById(Long id) {
        ChitPlan plan = chitPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CHIT_PLAN + id));
        return mapToResponse(plan);
    }

    @Override
    public Page<ChitPlanResponse> getAllPlans(Pageable pageable) {
        return chitPlanRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<ChitPlanResponse> getPlansByStatus(ChitStatus status) {
        return chitPlanRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChitPlanResponse> getAvailablePlans() {
        return chitPlanRepository.findAvailablePlans().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChitPlanResponse updatePlanStatus(Long id, ChitStatus status) {
        ChitPlan plan = chitPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CHIT_PLAN + id));
        plan.setStatus(status);
        plan.setUpdatedAt(LocalDateTime.now());
        plan = chitPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    private ChitPlanResponse mapToResponse(ChitPlan plan) {
        Long enrollmentCount = enrollmentRepository.countEnrollmentsByPlan(plan.getId());
        int currentEnrollments = enrollmentCount != null ? enrollmentCount.intValue() : 0;

        return ChitPlanResponse.builder()
                .id(plan.getId())
                .planName(plan.getPlanName())
                .totalAmount(plan.getTotalAmount())
                .durationMonths(plan.getDurationMonths())
                .monthlyAmount(plan.getMonthlyAmount())
                .maxMembers(plan.getMaxMembers())
                .currentEnrollments(currentEnrollments)
                .availableSlots(plan.getMaxMembers() - currentEnrollments)
                .description(plan.getDescription())
                .status(plan.getStatus())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .createdAt(plan.getCreatedAt())
                .createdBy(plan.getCreatedBy() != null ? plan.getCreatedBy().getFullName() : null)
                .build();
    }

}