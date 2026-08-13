package com.hunre.authservice.service;

import com.hunre.authservice.dto.LoginRequest;
import com.hunre.authservice.dto.LoginResponse;
import com.hunre.authservice.dto.RegisterRequest;
import com.hunre.authservice.dto.RegisterResponse;
import com.hunre.authservice.entity.Student;
import com.hunre.authservice.entity.User;
import com.hunre.authservice.enums.Role;
import com.hunre.authservice.exception.BusinessConflictException;
import com.hunre.authservice.exception.InvalidCredentialsException;
import com.hunre.authservice.repository.StudentRepository;
import com.hunre.authservice.repository.UserRepository;
import com.hunre.authservice.security.jwt.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String mssv = request.mssv().trim();

        if (userRepository.existsByUsername(username)) {
            throw new BusinessConflictException("Username already exists");
        }
        if (studentRepository.existsByMssv(mssv)) {
            throw new BusinessConflictException("Student ID already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        userRepository.save(user);

        Student student = new Student();
        student.setHoTen(request.hoTen().trim());
        student.setMssv(mssv);
        student.setUser(user);
        studentRepository.save(student);

        return RegisterResponse.builder()
                .userId(user.getId())
                .studentId(student.getId())
                .username(user.getUsername())
                .hoTen(student.getHoTen())
                .mssv(student.getMssv())
                .role(user.getRole())
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            return new LoginResponse(
                    jwtService.generateToken(userDetails),
                    "Bearer",
                    jwtService.getExpirationSeconds()
            );
        } catch (BadCredentialsException exception) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }
}
