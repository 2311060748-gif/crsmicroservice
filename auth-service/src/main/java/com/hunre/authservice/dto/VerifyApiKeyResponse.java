package com.hunre.authservice.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record VerifyApiKeyResponse(
        boolean valid,
        String message,
        String keyName,
        List<String> scopes,
        boolean hasRequiredScope
) {}
