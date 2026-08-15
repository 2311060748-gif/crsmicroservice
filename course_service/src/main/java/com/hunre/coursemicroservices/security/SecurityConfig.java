package com.hunre.coursemicroservices.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter,
            @Value("${internal.api-key}") String internalApiKey
    ) throws Exception {
        InternalApiKeyFilter internalApiKeyFilter = new InternalApiKeyFilter(internalApiKey);
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/internal/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/courses/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/courses/**").hasRole("ADMIN")
                        .anyRequest().denyAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(
                        jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                ))
                .addFilterBefore(internalApiKeyFilter, BearerTokenAuthenticationFilter.class)
                .build();
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${jwt.secret}") String base64Secret) {
        byte[] keyBytes = decodeSecret(base64Secret);
        MacAlgorithm algorithm = resolveAlgorithm(keyBytes);
        SecretKey key = new SecretKeySpec(keyBytes, jcaAlgorithm(algorithm));
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(algorithm).build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("role");
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }

    private byte[] decodeSecret(String secret) {
        try {
            return Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("jwt.secret must be valid Base64", exception);
        }
    }

    private MacAlgorithm resolveAlgorithm(byte[] keyBytes) {
        if (keyBytes.length >= 64) return MacAlgorithm.HS512;
        if (keyBytes.length >= 48) return MacAlgorithm.HS384;
        if (keyBytes.length >= 32) return MacAlgorithm.HS256;
        throw new IllegalArgumentException("jwt.secret must decode to at least 32 bytes");
    }

    private String jcaAlgorithm(MacAlgorithm algorithm) {
        if (MacAlgorithm.HS512.equals(algorithm)) return "HmacSHA512";
        if (MacAlgorithm.HS384.equals(algorithm)) return "HmacSHA384";
        return "HmacSHA256";
    }
}
