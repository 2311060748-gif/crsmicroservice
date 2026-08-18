package com.hunre.registrationservice.controller;

import com.hunre.registrationservice.dto.RegistrationRequestDTO;
import com.hunre.registrationservice.entity.Registration;
import com.hunre.registrationservice.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @GetMapping
    public Page<Registration> findAll(Pageable pageable) {
        return registrationService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public Registration getById(@PathVariable("id") Long id) {
        return registrationService.getById(id);
    }

    @GetMapping("/student/{studentId}")
    public Page<Registration> findByStudentId(
            @PathVariable("studentId") Long studentId,
            Pageable pageable
    ) {
        return registrationService.findByStudentId(studentId, pageable);
    }

    @GetMapping("/course/{courseId}")
    public Page<Registration> findByCourseId(
            @PathVariable("courseId") Long courseId,
            Pageable pageable
    ) {
        return registrationService.findByCourseId(courseId, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Registration register(
            @Valid @RequestBody RegistrationRequestDTO dto
    ) {
        return registrationService.register(dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable("id") Long id) {
        registrationService.cancel(id);
    }
}
