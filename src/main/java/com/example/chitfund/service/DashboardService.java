package com.example.chitfund.service;


import com.example.chitfund.dtos.response.CustomerDashboardResponse;
import com.example.chitfund.dtos.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboardReport();
    CustomerDashboardResponse getDashboard(Long customerId);
}
