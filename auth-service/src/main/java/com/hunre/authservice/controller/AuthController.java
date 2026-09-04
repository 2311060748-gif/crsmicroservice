package com.hunre.authservice.controller;

import com.hunre.authservice.dto.LoginRequest;
import com.hunre.authservice.dto.LoginResponse;
import com.hunre.authservice.dto.RegisterRequest;
import com.hunre.authservice.dto.RegisterResponse;
import com.hunre.authservice.repository.StudentRepository;
import com.hunre.authservice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final StudentRepository studentRepository;

    public AuthController(AuthService authService, StudentRepository studentRepository) {
        this.authService = authService;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public Map<String, Object> currentUser(Authentication authentication) {
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.replaceFirst("^ROLE_", ""))
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("username", authentication.getName());
        response.put("roles", roles);

        studentRepository.findByUserUsername(authentication.getName()).ifPresent(student -> {
            response.put("studentId", student.getId());
            response.put("hoTen", student.getHoTen());
            response.put("mssv", student.getMssv());
        });

        return response;
    }
}
