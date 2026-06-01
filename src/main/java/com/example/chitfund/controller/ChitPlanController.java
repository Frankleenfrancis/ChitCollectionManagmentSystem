package com.example.chitfund.controller;

import com.example.chitfund.dtos.ChitPlanRequest;
import com.example.chitfund.dtos.response.ApiResponse;
import com.example.chitfund.dtos.response.ChitPlanResponse;
import com.example.chitfund.enums.ChitStatus;
import com.example.chitfund.service.ChitPlanService;
import com.example.chitfund.util.ApiConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chit-plans")
@RequiredArgsConstructor
public class ChitPlanController {

    private final ChitPlanService chitPlanService;


    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<ChitPlanResponse>> createPlan(
            @Valid @RequestBody ChitPlanRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ChitPlanResponse response = chitPlanService.createPlan(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(ApiConstants.CHIT_PLAN_CREATED, response));
    }


    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ChitPlanResponse>> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody ChitPlanRequest request) {
        ChitPlanResponse response = chitPlanService.updatePlan(id, request);
        return ResponseEntity.ok(ApiResponse.success(ApiConstants.CHIT_PLAN_UPDATED, response));
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<ChitPlanResponse>> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(chitPlanService.getPlanById(id)));
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Page<ChitPlanResponse>>> getAllPlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(chitPlanService.getAllPlans(pageable)));
    }


    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<ChitPlanResponse>>> getPlansByStatus(
            @PathVariable ChitStatus status) {
        return ResponseEntity.ok(ApiResponse.success(chitPlanService.getPlansByStatus(status)));
    }


    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<ChitPlanResponse>>> getAvailablePlans() {
        return ResponseEntity.ok(ApiResponse.success(chitPlanService.getAvailablePlans()));
    }


    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ChitPlanResponse>> updatePlanStatus(
            @PathVariable Long id,
            @RequestParam ChitStatus status) {
        ChitPlanResponse response = chitPlanService.updatePlanStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(ApiConstants.PLAN_STATUS_UPDATED_TO + status, response));
    }
}
