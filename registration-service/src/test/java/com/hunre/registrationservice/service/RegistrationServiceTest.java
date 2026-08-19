package com.hunre.registrationservice.service;

import com.hunre.registrationservice.client.CourseClient;
import com.hunre.registrationservice.entity.Registration;
import com.hunre.registrationservice.repository.RegistrationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private CourseClient courseClient;

    @InjectMocks
    private RegistrationService registrationService;

    @Test
    void findAllForwardsPageableToRepository() {
        Pageable pageable = PageRequest.of(1, 10);
        Page<Registration> expected = new PageImpl<>(List.of(new Registration()));
        when(registrationRepository.findAll(pageable)).thenReturn(expected);

        Page<Registration> actual = registrationService.findAll(pageable);

        assertThat(actual).isSameAs(expected);
        verify(registrationRepository).findAll(pageable);
    }

    @Test
    void findByStudentIdForwardsPageableToRepository() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<Registration> expected = new PageImpl<>(List.of(new Registration()));
        when(registrationRepository.findByStudentId(7L, pageable)).thenReturn(expected);

        Page<Registration> actual = registrationService.findByStudentId(7L, pageable);

        assertThat(actual).isSameAs(expected);
        verify(registrationRepository).findByStudentId(7L, pageable);
    }

    @Test
    void findByCourseIdForwardsPageableToRepository() {
        Pageable pageable = PageRequest.of(2, 20);
        Page<Registration> expected = new PageImpl<>(List.of(new Registration()));
        when(registrationRepository.findByCourseId(11L, pageable)).thenReturn(expected);

        Page<Registration> actual = registrationService.findByCourseId(11L, pageable);

        assertThat(actual).isSameAs(expected);
        verify(registrationRepository).findByCourseId(11L, pageable);
    }
}
