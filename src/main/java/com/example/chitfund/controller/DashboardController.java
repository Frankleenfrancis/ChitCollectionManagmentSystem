package com.example.chitfund.controller;

import com.example.chitfund.dtos.response.ApiResponse;

import com.example.chitfund.dtos.response.DashboardResponse;

import com.example.chitfund.service.CustomerService;
import com.example.chitfund.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse report = dashboardService.getDashboardReport();
        return ResponseEntity.ok(ApiResponse.success("Dashboard report fetched successfully", report));
    }

}