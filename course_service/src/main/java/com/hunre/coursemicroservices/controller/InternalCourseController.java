package com.hunre.coursemicroservices.controller;

import com.hunre.coursemicroservices.dto.CourseDTO;
import com.hunre.coursemicroservices.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/courses")
@RequiredArgsConstructor
public class InternalCourseController {
    private final CourseService courseService;

    @PatchMapping("/{id}/reserve-seat")
    public CourseDTO reserveSeat(@PathVariable Long id) {
        return courseService.reserveSeat(id);
    }
    @PatchMapping("/{id}/release-seat")
    public CourseDTO releaseSeat(@PathVariable Long id) {
        return courseService.releaseSeat(id);
    }
}
