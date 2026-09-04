package com.hunre.authservice.service;

import com.hunre.authservice.dto.*;
import com.hunre.authservice.entity.ApiKey;
import com.hunre.authservice.exception.ResourceNotFoundException;
import com.hunre.authservice.repository.ApiKeyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.List;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public ApiKeyService(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Transactional
    public CreatedApiKeyResponse createApiKey(CreateApiKeyRequest request, String createdBy) {
        // Sinh key ngẫu nhiên 16 bytes = 32 ký tự hex
        byte[] randomBytes = new byte[16];
        secureRandom.nextBytes(randomBytes);
        String randomHex = HexFormat.of().formatHex(randomBytes);
        String rawKey = "crs_live_" + randomHex;

        String keyPrefix = rawKey.substring(0, 15) + "...";
        String keyHash = hashKey(rawKey);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = (request.expirationDays() != null && request.expirationDays() > 0)
                ? now.plusDays(request.expirationDays())
                : null;

        String scopesStr = String.join(",", request.scopes());

        ApiKey apiKey = ApiKey.builder()
                .name(request.name().trim())
                .keyPrefix(keyPrefix)
                .keyHash(keyHash)
                .scopes(scopesStr)
                .status("ACTIVE")
                .createdAt(now)
                .expiresAt(expiresAt)
                .createdBy(createdBy != null ? createdBy : "ADMIN")
                .build();

        ApiKey saved = apiKeyRepository.save(apiKey);

        return CreatedApiKeyResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .rawKey(rawKey)
                .keyPrefix(saved.getKeyPrefix())
                .scopes(Arrays.asList(saved.getScopes().split(",")))
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .expiresAt(saved.getExpiresAt())
                .createdBy(saved.getCreatedBy())
                .build();
    }

    public List<ApiKeyResponse> getAllApiKeys() {
        return apiKeyRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ApiKeyResponse revokeApiKey(Long id) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy API Key với ID: " + id));

        apiKey.setStatus("REVOKED");
        apiKey.setRevokedAt(LocalDateTime.now());
        ApiKey saved = apiKeyRepository.save(apiKey);

        return toResponse(saved);
    }

    public VerifyApiKeyResponse verifyApiKey(VerifyApiKeyRequest request) {
        String keyHash = hashKey(request.apiKey().trim());
        var optKey = apiKeyRepository.findByKeyHash(keyHash);

        if (optKey.isEmpty()) {
            return VerifyApiKeyResponse.builder()
                    .valid(false)
                    .message("Khóa API không tồn tại trong hệ thống")
                    .hasRequiredScope(false)
                    .build();
        }

        ApiKey apiKey = optKey.get();

        if ("REVOKED".equalsIgnoreCase(apiKey.getStatus())) {
            return VerifyApiKeyResponse.builder()
                    .valid(false)
                    .keyName(apiKey.getName())
                    .message("Khóa API này đã bị thu hồi quyền truy cập")
                    .hasRequiredScope(false)
                    .build();
        }

        if (apiKey.getExpiresAt() != null && apiKey.getExpiresAt().isBefore(LocalDateTime.now())) {
            return VerifyApiKeyResponse.builder()
                    .valid(false)
                    .keyName(apiKey.getName())
                    .message("Khóa API này đã hết hạn sử dụng")
                    .hasRequiredScope(false)
                    .build();
        }

        List<String> scopes = Arrays.asList(apiKey.getScopes().split(","));
        boolean hasScope = true;

        if (request.requiredScope() != null && !request.requiredScope().isBlank()) {
            String required = request.requiredScope().trim();
            hasScope = scopes.contains(required) || scopes.contains("*") || scopes.contains("ALL");
        }

        return VerifyApiKeyResponse.builder()
                .valid(true)
                .keyName(apiKey.getName())
                .scopes(scopes)
                .hasRequiredScope(hasScope)
                .message(hasScope
                        ? "Khóa API hợp lệ và có đầy đủ quyền truy cập"
                        : "Khóa API hợp lệ nhưng KHÔNG CÓ quyền: " + request.requiredScope())
                .build();
    }

    private ApiKeyResponse toResponse(ApiKey entity) {
        List<String> scopes = (entity.getScopes() != null && !entity.getScopes().isBlank())
                ? Arrays.asList(entity.getScopes().split(","))
                : List.of();

        // Kiểm tra tự động hết hạn
        String status = entity.getStatus();
        if ("ACTIVE".equalsIgnoreCase(status) && entity.getExpiresAt() != null
                && entity.getExpiresAt().isBefore(LocalDateTime.now())) {
            status = "EXPIRED";
        }

        return ApiKeyResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .keyPrefix(entity.getKeyPrefix())
                .scopes(scopes)
                .status(status)
                .createdAt(entity.getCreatedAt())
                .expiresAt(entity.getExpiresAt())
                .revokedAt(entity.getRevokedAt())
                .createdBy(entity.getCreatedBy())
                .build();
    }

    private String hashKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
