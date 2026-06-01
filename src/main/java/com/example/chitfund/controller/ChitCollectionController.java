package com.example.chitfund.controller;

import com.example.chitfund.dtos.CollectionEntryRequest;
import com.example.chitfund.dtos.EnrollmentRequest;
import com.example.chitfund.dtos.response.ApiResponse;
import com.example.chitfund.dtos.response.CollectionEntryResponse;
import com.example.chitfund.dtos.response.EnrollmentResponse;
import com.example.chitfund.service.ChitCollectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1")
public class ChitCollectionController {

    private final ChitCollectionService chitCollectionService;


    @PostMapping("/enrollments")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enrollCustomer(
            @Valid @RequestBody EnrollmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        EnrollmentResponse response = chitCollectionService.enrollCustomer(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer enrolled successfully", response));
    }


    @GetMapping("/enrollments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> getEnrollmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(chitCollectionService.getEnrollmentById(id)));
    }


    @GetMapping("/enrollments")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Page<EnrollmentResponse>>> getAllEnrollments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(chitCollectionService.getAllEnrollments(pageable)));
    }

    @GetMapping("/enrollments/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getEnrollmentsByCustomer(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(
                chitCollectionService.getEnrollmentsByCustomer(customerId)));
    }


    @GetMapping("/enrollments/plan/{planId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getEnrollmentsByPlan(
            @PathVariable Long planId) {
        return ResponseEntity.ok(ApiResponse.success(
                chitCollectionService.getEnrollmentsByPlan(planId)));
    }


    @PostMapping("/collections")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<CollectionEntryResponse>> createCollectionEntry(
            @Valid @RequestBody CollectionEntryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CollectionEntryResponse response = chitCollectionService.createCollectionEntry(
                request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Collection entry created successfully", response));
    }


    @GetMapping("/collections/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<CollectionEntryResponse>> getCollectionEntryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(chitCollectionService.getCollectionEntryById(id)));
    }


    @GetMapping("/collections/enrollment/{enrollmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<CollectionEntryResponse>>> getCollectionHistoryByEnrollment(
            @PathVariable Long enrollmentId) {
        return ResponseEntity.ok(ApiResponse.success(
                chitCollectionService.getCollectionHistoryByEnrollment(enrollmentId)));
    }

    @GetMapping("/collections/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<CollectionEntryResponse>>> getCollectionHistoryByCustomer(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(
                chitCollectionService.getCollectionHistoryByCustomer(customerId)));
    }


    @GetMapping("/collections/pending/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<CollectionEntryResponse>>> getPendingCollections(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(
                chitCollectionService.getPendingCollections(customerId)));
    }


    @GetMapping("/collections/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<CollectionEntryResponse>>> getOverdueCollections() {
        return ResponseEntity.ok(ApiResponse.success(chitCollectionService.getOverdueCollections()));
    }
}