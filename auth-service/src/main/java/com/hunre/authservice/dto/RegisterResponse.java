package com.hunre.authservice.dto;

import com.hunre.authservice.enums.Role;
import lombok.Builder;

@Builder
public record RegisterResponse(
        Long userId,
        Long studentId,
        String username,
        String hoTen,
        String mssv,
        Role role
) {
}
