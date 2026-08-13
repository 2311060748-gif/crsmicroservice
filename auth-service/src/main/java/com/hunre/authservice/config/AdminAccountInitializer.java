package com.hunre.authservice.config;

import com.hunre.authservice.entity.User;
import com.hunre.authservice.enums.Role;
import com.hunre.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminAccountInitializer implements ApplicationRunner {
    private static final Logger LOGGER = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminPassword;

    public AdminAccountInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${auth.bootstrap-admin.username:}") String adminUsername,
            @Value("${auth.bootstrap-admin.password:}") String adminPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername.trim();
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminUsername.isBlank() && adminPassword.isBlank()) {
            return;
        }
        if (adminUsername.isBlank() || adminPassword.length() < 8) {
            throw new IllegalStateException(
                    "ADMIN_USERNAME is required and ADMIN_PASSWORD must contain at least 8 characters"
            );
        }

        userRepository.findByUsername(adminUsername).ifPresentOrElse(existingUser -> {
            if (existingUser.getRole() == Role.ADMIN) {
                LOGGER.info("Bootstrap admin '{}' already exists", adminUsername);
            } else {
                LOGGER.warn("Bootstrap username '{}' already belongs to a non-admin user", adminUsername);
            }
        }, () -> {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            LOGGER.info("Created bootstrap admin '{}'", adminUsername);
        });
    }
}
