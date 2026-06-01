package com.example.chitfund.dtos.response;

import com.example.chitfund.entity.ChitEnrollment;
import com.example.chitfund.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String city;
    private boolean active;
    private BigDecimal totalPaid;
    private BigDecimal totalPending;
    private Integer activeChits;
    private String chitGroupName;
    private BigDecimal totalValue;
    private BigDecimal amountPaid;
    private LocalDateTime createdAt;
    private String createdBy;
}