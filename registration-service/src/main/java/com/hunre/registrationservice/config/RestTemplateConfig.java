package com.hunre.registrationservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(@Value("${internal.api-key}") String internalApiKey) {
        RestTemplate restTemplate = new RestTemplate(
                new JdkClientHttpRequestFactory()
        );
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().set("X-Internal-Key", internalApiKey);
            return execution.execute(request, body);
        });
        return restTemplate;
    }
}
