package com.example.chitfund.service;

import com.example.chitfund.dtos.CollectionEntryRequest;
import com.example.chitfund.dtos.EnrollmentRequest;
import com.example.chitfund.dtos.response.CollectionEntryResponse;
import com.example.chitfund.dtos.response.EnrollmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChitCollectionService {
    EnrollmentResponse enrollCustomer(EnrollmentRequest request, String username);
    EnrollmentResponse getEnrollmentById(Long id);
    List<EnrollmentResponse> getEnrollmentsByCustomer(Long customerId);
    List<EnrollmentResponse> getEnrollmentsByPlan(Long planId);
    Page<EnrollmentResponse> getAllEnrollments(Pageable pageable);

    CollectionEntryResponse createCollectionEntry(CollectionEntryRequest request, String username);
    CollectionEntryResponse getCollectionEntryById(Long id);
    List<CollectionEntryResponse> getCollectionHistoryByEnrollment(Long enrollmentId);
    List<CollectionEntryResponse> getCollectionHistoryByCustomer(Long customerId);
    List<CollectionEntryResponse> getPendingCollections(Long customerId);
    List<CollectionEntryResponse> getOverdueCollections();
}
