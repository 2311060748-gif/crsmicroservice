package com.hunre.authservice.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record CreatedApiKeyResponse(
        Long id,
        String name,
        String rawKey,
        String keyPrefix,
        List<String> scopes,
        String status,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        String createdBy
) {}
