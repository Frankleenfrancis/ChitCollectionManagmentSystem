package com.example.chitfund.service;

import com.example.chitfund.dtos.AdminCreateUserRequest;
import com.example.chitfund.dtos.LoginRequest;
import com.example.chitfund.dtos.RegisterRequest;
import com.example.chitfund.dtos.response.AuthResponse;
import com.example.chitfund.entity.User;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface AuthService {
    AuthResponse<User> login(LoginRequest request, HttpServletResponse response);
    Page<User> getUsers(Pageable pageable, String search);
    AuthResponse<User> registerCustomer(RegisterRequest request);

    AuthResponse<User> createUserByAdmin (AdminCreateUserRequest request);
    AuthResponse getProfile(Authentication authentication);
}
