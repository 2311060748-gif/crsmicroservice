package com.hunre.registrationservice.client;

import com.hunre.registrationservice.exception.BusinessConflictException;
import com.hunre.registrationservice.exception.ResourceNotFoundException;
import com.hunre.registrationservice.exception.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class CourseClient {

    private final RestTemplate restTemplate;

    @Value("${course-service.base-url}")
    private String courseServiceBaseUrl;

    public void reserveSeat(Long courseId) {

        String url = courseServiceBaseUrl
                + "/internal/courses/"
                + courseId
                + "/reserve-seat";

        try {

            restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    null,
                    Void.class
            );

        } catch (HttpClientErrorException.NotFound e) {

            throw new ResourceNotFoundException(
                    "Môn học không tồn tại"
            );

        } catch (HttpClientErrorException.Conflict e) {

            throw new BusinessConflictException(
                    "Môn học đã hết chỗ"
            );

        } catch (HttpServerErrorException | ResourceAccessException e) {

            throw new ServiceUnavailableException(
                    "Không thể kết nối tới course-service"
            );
        }
    }

    public void releaseSeat(Long courseId) {

        String url = courseServiceBaseUrl
                + "/internal/courses/"
                + courseId
                + "/release-seat";

        try {

            restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    null,
                    Void.class
            );

        } catch (HttpClientErrorException.NotFound e) {

            throw new ResourceNotFoundException(
                    "Môn học không tồn tại"
            );

        } catch (HttpClientErrorException.Conflict e) {

            throw new BusinessConflictException(
                    "Không thể trả chỗ môn học"
            );

        } catch (HttpServerErrorException | ResourceAccessException e) {

            throw new ServiceUnavailableException(
                    "Không thể kết nối tới course-service"
            );
        }
    }
}
