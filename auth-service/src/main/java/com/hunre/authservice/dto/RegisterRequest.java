package com.hunre.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Username is required")
        @Size(max = 255, message = "Username must not exceed 255 characters")
        @Pattern(regexp = "\\S+", message = "Username must not contain whitespace")
        String username,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must contain between 8 and 72 characters")
        String password,

        @NotBlank(message = "Student name is required")
        @Size(max = 255, message = "Student name must not exceed 255 characters")
        String hoTen,

        @NotBlank(message = "Student ID is required")
        @Size(max = 100, message = "Student ID must not exceed 100 characters")
        @Pattern(regexp = "\\S+", message = "Student ID must not contain whitespace")
        String mssv
) {
}
