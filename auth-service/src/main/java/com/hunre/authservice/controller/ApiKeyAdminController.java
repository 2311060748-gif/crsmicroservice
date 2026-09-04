package com.hunre.authservice.controller;

import com.hunre.authservice.dto.*;
import com.hunre.authservice.service.ApiKeyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/api-keys")
public class ApiKeyAdminController {

    private final ApiKeyService apiKeyService;

    public ApiKeyAdminController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @GetMapping
    public List<ApiKeyResponse> getAll() {
        return apiKeyService.getAllApiKeys();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedApiKeyResponse create(
            @Valid @RequestBody CreateApiKeyRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "ADMIN";
        return apiKeyService.createApiKey(request, username);
    }

    @DeleteMapping("/{id}")
    public ApiKeyResponse revoke(@PathVariable Long id) {
        return apiKeyService.revokeApiKey(id);
    }

    @PostMapping("/verify")
    public VerifyApiKeyResponse verify(@Valid @RequestBody VerifyApiKeyRequest request) {
        return apiKeyService.verifyApiKey(request);
    }
}
