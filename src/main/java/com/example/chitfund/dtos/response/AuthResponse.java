package com.example.chitfund.dtos.response;

import com.example.chitfund.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse<U> {
    private String token;
    private String message;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private Role role;
}