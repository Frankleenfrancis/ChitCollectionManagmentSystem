package com.example.chitfund.service;

import com.example.chitfund.dtos.CustomerRequest;
import com.example.chitfund.dtos.response.CustomerResponse;
import com.example.chitfund.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    CustomerResponse addCustomer(CustomerRequest request, String username);
    CustomerResponse updateCustomer(Long id, CustomerRequest request);
    CustomerResponse getCustomerById(Long id);
    CustomerResponse getCustomerByPhone(String phone);
    Page<CustomerResponse> getAllCustomers(Pageable pageable);
    Page<CustomerResponse> searchCustomers(String keyword, Pageable pageable);
    CustomerResponse deactivateCustomer(Long id);
    CustomerResponse getCustomerByUserId(Long userId);
    Customer getLoggedInCustomer(String username);


}