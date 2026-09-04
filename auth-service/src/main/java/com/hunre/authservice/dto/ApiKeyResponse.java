package com.hunre.authservice.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record ApiKeyResponse(
        Long id,
        String name,
        String keyPrefix,
        List<String> scopes,
        String status,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        LocalDateTime revokedAt,
        String createdBy
) {}
