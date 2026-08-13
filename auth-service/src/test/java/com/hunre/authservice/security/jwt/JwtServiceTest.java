package com.hunre.authservice.security.jwt;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {
    private static final String SECRET =
            "VGhpc0lzQVRlc3RTZWNyZXRUaGF0SXNBdExlYXN0VGhpcnR5VHdvQnl0ZXNMb25nIQ==";

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 3_600_000);
        userDetails = User.withUsername("student01")
                .password("encoded-password")
                .roles("USER")
                .build();
    }

    @Test
    void generatedTokenContainsUsernameAndIsValidForItsOwner() {
        String token = jwtService.generateToken(userDetails);

        assertEquals("student01", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
        assertEquals(3_600, jwtService.getExpirationSeconds());
    }

    @Test
    void tokenIsNotValidForAnotherUser() {
        String token = jwtService.generateToken(userDetails);
        UserDetails anotherUser = User.withUsername("student02")
                .password("encoded-password")
                .roles("USER")
                .build();

        assertFalse(jwtService.isTokenValid(token, anotherUser));
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = jwtService.generateToken(userDetails);
        char replacement = token.charAt(token.length() - 1) == 'a' ? 'b' : 'a';
        String tamperedToken = token.substring(0, token.length() - 1) + replacement;

        assertThrows(JwtException.class, () -> jwtService.extractUsername(tamperedToken));
    }

    @Test
    void weakSecretIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> new JwtService("c2hvcnQ=", 3_600_000));
    }
}
