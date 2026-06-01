package com.example.chitfund.repository;

import com.example.chitfund.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

//   Optional< Customer> findTopByOrderByIdDesc();

    Optional<Customer> findByPhone(String phone);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    Page<Customer> findByActiveTrue(Pageable pageable);


    @Query(value = "SELECT DISTINCT c FROM Customer c " +
            "LEFT JOIN FETCH c.enrollments e " +
            "LEFT JOIN FETCH e.chitPlan",
            countQuery = "SELECT COUNT(c) FROM Customer c")
    Page<Customer> findAllCustomersWithPlans(Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.active = true AND " +
            "(LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "c.phone LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Customer> searchCustomers(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.active = true")
    Long countActiveCustomers();

    Optional<Customer> findByUserId(Long userId);
}