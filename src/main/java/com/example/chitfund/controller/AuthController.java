package com.example.chitfund.controller;

import com.example.chitfund.dtos.AdminCreateUserRequest;
import com.example.chitfund.dtos.LoginRequest;
import com.example.chitfund.dtos.RegisterRequest;
import com.example.chitfund.dtos.response.ApiResponse;
import com.example.chitfund.dtos.response.AuthResponse;
import com.example.chitfund.dtos.response.CustomerResponse;
import com.example.chitfund.entity.User;
import com.example.chitfund.service.AuthService;

import com.example.chitfund.service.CustomerService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;


import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private  final CustomerService customerService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerCustomer(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            value = "/admin/create-user",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<AuthResponse>> createUserByAdmin(

            @RequestPart("user") AdminCreateUserRequest request,

            @RequestPart(value = "image", required = false)
            MultipartFile image) {

        AuthResponse response =
                authService.createUserByAdmin(request, image);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User created successfully",
                        response
                )
        );
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success("Users", authService.getUsers(pageable, search)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CustomerResponse> getCustomerByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                customerService.getCustomerByUserId(userId)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")  // ← "token" not "jwt"
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logged out successfully");
    }
}