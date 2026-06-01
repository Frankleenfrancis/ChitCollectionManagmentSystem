package com.example.chitfund.service;

import com.example.chitfund.dtos.ChitPlanRequest;
import com.example.chitfund.dtos.response.ChitPlanResponse;
import com.example.chitfund.enums.ChitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChitPlanService {
    ChitPlanResponse createPlan(ChitPlanRequest request, String username);
    ChitPlanResponse updatePlan(Long id, ChitPlanRequest request);
    ChitPlanResponse getPlanById(Long id);
    Page<ChitPlanResponse> getAllPlans(Pageable pageable);
    List<ChitPlanResponse> getPlansByStatus(ChitStatus status);
    List<ChitPlanResponse> getAvailablePlans();
    ChitPlanResponse updatePlanStatus(Long id, ChitStatus status);
}