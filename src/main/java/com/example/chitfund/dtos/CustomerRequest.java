package com.example.chitfund.dtos;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CustomerRequest {


    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "user name is required")
    private String username;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit phone number")
    private String phone;

    @Email(message = "Enter a valid email address")
    private String email;

   
    private String password;


    private String address;

    private String city;

    private Long chitPlanId;

}
