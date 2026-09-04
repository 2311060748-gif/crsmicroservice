package com.hunre.authservice.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyApiKeyRequest(
        @NotBlank(message = "API Key không được để trống") String apiKey,
        String requiredScope
) {}
