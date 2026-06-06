package com.example.chitfund.service.impl;

import com.example.chitfund.dtos.CustomerRequest;
import com.example.chitfund.dtos.response.CustomerResponse;
import com.example.chitfund.entity.ChitEnrollment;
import com.example.chitfund.entity.ChitPlan;
import com.example.chitfund.entity.Customer;
import com.example.chitfund.entity.User;
import com.example.chitfund.enums.Role;
import com.example.chitfund.exception.DuplicateDataException;
import com.example.chitfund.exception.ResourceNotFoundException;
import com.example.chitfund.repository.ChitEnrollmentRepository;
import com.example.chitfund.repository.ChitPlanRepository;
import com.example.chitfund.repository.CustomerRepository;
import com.example.chitfund.repository.UserRepository;
import com.example.chitfund.service.CustomerService;
import com.example.chitfund.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ChitEnrollmentRepository enrollmentRepository;
    private final ChitPlanRepository chitPlanRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CustomerResponse addCustomer(CustomerRequest request, String username) {

        // 1. Core Validations
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateDataException(ApiConstants.CUSTOMER_ALREADY_EXIST + request.getPhone());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank() && customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateDataException(ApiConstants.CUSTOMER_EMAIL_ALREADY_EXIST + request.getEmail());
        }

        // Create Login User
        User customerUser = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .email(request.getEmail())
                .role(Role.CUSTOMER)
                .active(true)
                .build();

        customerUser = userRepository.save(customerUser);

        User adminUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.ADMIN_NOT_FOUND + username));


        // 2. Build and save the baseline Customer entity
        Customer customer = Customer.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .city(request.getCity())
                .user(customerUser)
                .active(true)
                .createdBy(adminUser)
                .build();

        Customer saved = customerRepository.save(customer);

        ChitPlan plan = null;
        if (request.getChitPlanId() != null) {
            plan = chitPlanRepository.findById(request.getChitPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chit Plan not found with ID: " + request.getChitPlanId()));
        }

        if (plan != null) {

            ChitEnrollment enrollment=ChitEnrollment.builder()
                    .customer(saved)
                    .chitPlan(plan)
                    .status(com.example.chitfund.enums.ChitStatus.ACTIVE) // Or whatever your enrollment enum package is
                    .build();

            enrollmentRepository.save(enrollment);

            saved.setEnrollments(java.util.List.of(enrollment));
        }
            return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CUSTOMER +id));

        if (!customer.getPhone().equals(request.getPhone())
                && customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateDataException(ApiConstants.CUSTOMER_ALREADY_EXIST + request.getPhone());
        }

        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());

        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CUSTOMER+ id));
        return mapToResponse(customer);
    }

    @Override
    public CustomerResponse getCustomerByPhone(String phone) {
        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException
                        (ApiConstants.CUSTOMER_NOT_FOUND_PHONE + phone));
        return mapToResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        return customerRepository.findByActiveTrue(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> searchCustomers(String keyword, Pageable pageable) {
        return customerRepository.searchCustomers(keyword, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public CustomerResponse deactivateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ApiConstants.CUSTOMER+ id));
        customer.setActive(false);
        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    @Override
    public CustomerResponse getCustomerByUserId(Long userId) {

        Customer customer = customerRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return mapToResponse(customer);
    }

    @Override
    public Customer getLoggedInCustomer(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return customerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));
    }


    private CustomerResponse mapToResponse(Customer customer) {
        BigDecimal totalPaid = enrollmentRepository.getTotalPaidByCustomer(customer.getId());
        BigDecimal totalPending = enrollmentRepository.getTotalPendingByCustomer(customer.getId());
        long activeChits = customer.getEnrollments() != null
                ? customer.getEnrollments().stream()
                .filter(e -> e.getStatus().name().equals("ACTIVE")).count()
                : 0;

        String planName = "N/A";
        BigDecimal totalValue = BigDecimal.ZERO;

        if (customer.getEnrollments() != null && !customer.getEnrollments().isEmpty()) {
            // Grab the most recent or active enrollment entry
            var activeEnrollment = customer.getEnrollments().stream()
                    .filter(e -> e.getStatus().name().equals("ACTIVE"))
                    .findFirst()
                    .orElse(customer.getEnrollments().get(0));

            if (activeEnrollment != null && activeEnrollment.getChitPlan() != null) {
                // Safe navigation to the parent bridge entity configurations
                planName = activeEnrollment.getChitPlan().getPlanName();
                totalValue = activeEnrollment.getChitPlan().getTotalAmount();
            }
        }

        return CustomerResponse.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .email(customer.getEmail())

                .address(customer.getAddress())
                .city(customer.getCity())
                .active(customer.isActive())
                .totalPaid(totalPaid != null ? totalPaid : BigDecimal.ZERO)
                .totalPending(totalPending != null ? totalPending : BigDecimal.ZERO)
                .activeChits((int) activeChits)
//                .user(customer.getUser())
                .chitGroupName(planName)
                .totalValue(totalValue)

                .createdAt(customer.getCreatedAt())
                .createdBy(customer.getCreatedBy() != null ? customer.getCreatedBy().getFullName() : null)
                .build();
    }
}
