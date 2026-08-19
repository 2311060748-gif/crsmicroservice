package com.hunre.apigateway.security;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtCompatibilityTest {

    @ParameterizedTest
    @ValueSource(ints = {32, 48, 64})
    void decoderSupportsAlgorithmSelectedFromSecretLength(int keyLength) {
        byte[] keyBytes = new byte[keyLength];
        for (int index = 0; index < keyBytes.length; index++) {
            keyBytes[index] = (byte) (index + 1);
        }

        MacAlgorithm algorithm = keyLength >= 64
                ? MacAlgorithm.HS512
                : keyLength >= 48 ? MacAlgorithm.HS384 : MacAlgorithm.HS256;
        String jcaAlgorithm = keyLength >= 64
                ? "HmacSHA512"
                : keyLength >= 48 ? "HmacSHA384" : "HmacSHA256";
        SecretKey key = new SecretKeySpec(keyBytes, jcaAlgorithm);

        JwtEncoder encoder = NimbusJwtEncoder.withSecretKey(key)
                .algorithm(algorithm)
                .build();
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject("student01")
                .claim("role", "USER")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(300))
                .build();
        String token = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(algorithm).build(),
                claims
        )).getTokenValue();

        SecurityConfig securityConfig = new SecurityConfig();
        JwtDecoder decoder = securityConfig.jwtDecoder(Base64.getEncoder().encodeToString(keyBytes));
        Jwt decoded = decoder.decode(token);

        assertEquals("student01", decoded.getSubject());
        assertEquals("USER", decoded.getClaimAsString("role"));
        assertTrue(securityConfig.jwtAuthenticationConverter()
                .convert(decoded)
                .getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_USER")));
    }
}
