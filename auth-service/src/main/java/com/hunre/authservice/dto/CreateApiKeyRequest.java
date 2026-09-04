package com.hunre.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateApiKeyRequest(
        @NotBlank(message = "Tên định danh API Key không được để trống") String name,
        @NotEmpty(message = "Phải chọn ít nhất một quyền (scope)") List<String> scopes,
        Integer expirationDays
) {}
