package com.example.chitfund.service.impl;

import com.example.chitfund.dtos.AdminCreateUserRequest;
import com.example.chitfund.dtos.LoginRequest;
import com.example.chitfund.dtos.RegisterRequest;
import com.example.chitfund.dtos.response.AuthResponse;
import com.example.chitfund.entity.Customer;
import com.example.chitfund.entity.User;
import com.example.chitfund.enums.Role;
import com.example.chitfund.exception.DuplicateDataException;
import com.example.chitfund.repository.CustomerRepository;
import com.example.chitfund.repository.UserRepository;
import com.example.chitfund.security.JwtUtil;
import com.example.chitfund.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomerRepository customerRepository;


    @Override
    public AuthResponse<User> login(
            LoginRequest request,
            HttpServletResponse response
    ) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user);

        Cookie cookie = new Cookie("token", token);

        cookie.setHttpOnly(true);

        cookie.setSecure(false); // true in production HTTPS

        cookie.setPath("/");

        cookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(cookie);

        return buildAuthResponse(user, token);
    }


    @Override
    public AuthResponse<User> registerCustomer(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateDataException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateDataException("Email already registered: " + request.getEmail());
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateDataException("Phone already registered: " + request.getPhone());
        }

        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username required");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(Role.CUSTOMER)
                .active(true)
                .build();

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user);
        return buildAuthResponse(user, token);
    }

    @Override
    public AuthResponse<User> createUserByAdmin(AdminCreateUserRequest request) {

        if (userRepository.existsByUsername(request.getUsername()))
            throw new DuplicateDataException("Username already taken: " + request.getUsername());

        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole()) // ONLY ADMIN CONTROLS THIS
                .active(true)
                .build();

       User savedUser= userRepository.save(user);

        if (customerRepository.existsByPhone(savedUser.getPhone())) {
            throw new RuntimeException("Customer already exists");
        }

        if (user.getRole() == Role.CUSTOMER) {

            Customer customer = Customer.builder()
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .email(user.getEmail())
                    .active(true)
                    .build();



            customerRepository.save(customer);


        }
        return buildAuthResponse(user, jwtUtil.generateToken(user));
    }


    @Override
    public Page<User> getUsers(Pageable pageable, String search) {
        if (search != null && !search.isBlank()) {
            return userRepository.findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                    search, search, pageable);
        }
        return userRepository.findAll(pageable);
    }

    @Override
    public AuthResponse getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return buildAuthResponse(user, null);
    }

    private AuthResponse<User> buildAuthResponse(User user, String token) {
        return AuthResponse.<User>builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}