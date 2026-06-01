package com.example.chitfund.controller;


import com.example.chitfund.dtos.CustomerRequest;
import com.example.chitfund.dtos.response.ApiResponse;
import com.example.chitfund.dtos.response.CustomerDashboardResponse;
import com.example.chitfund.dtos.response.CustomerResponse;
import com.example.chitfund.entity.Customer;
import com.example.chitfund.service.CustomerService;
import com.example.chitfund.service.DashboardService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final DashboardService dashboardService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<CustomerResponse>> addCustomer(
            @Valid @RequestBody CustomerRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CustomerResponse response =
                customerService.addCustomer(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(ApiConstants.CUSTOMER_ADDED, response));
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse response =
                customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.success
                (ApiConstants.CUSTOMER_UPDATED, response));
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success
                (customerService.getCustomerById(id)));
    }


    @GetMapping("/phone/{phone}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerByPhone(@PathVariable String phone) {
        return ResponseEntity.ok(ApiResponse.success
                (customerService.getCustomerByPhone(phone)));
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(ApiResponse.success
                (customerService.getAllCustomers(pageable)));
    }


    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> searchCustomers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);

        return ResponseEntity.ok(ApiResponse.success
                (customerService.searchCustomers(keyword, pageable)));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerResponse>> deactivateCustomer(@PathVariable Long id) {
        CustomerResponse response =
                customerService.deactivateCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(
                ApiConstants.CUSTOMER_DEACTIVATED, response));
    }

    @GetMapping("/my-profile")
    public ResponseEntity<Customer> getMyProfile(
            Authentication authentication) {

        Customer customer =
                customerService.getLoggedInCustomer(
                        authentication.getName());

        return ResponseEntity.ok(customer);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<CustomerDashboardResponse> dashboard(
            Authentication authentication) {

        Customer customer =
                customerService.getLoggedInCustomer(
                        authentication.getName());

        return ResponseEntity.ok(
                dashboardService.getDashboard(customer.getId())
        );
    }
}



