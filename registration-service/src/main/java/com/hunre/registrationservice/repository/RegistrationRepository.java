package com.hunre.registrationservice.repository;

import com.hunre.registrationservice.entity.Registration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    Page<Registration> findByStudentId(
            Long studentId,
            Pageable pageable
    );

    Page<Registration> findByCourseId(
            Long courseId,
            Pageable pageable
    );

    boolean existsByStudentIdAndCourseIdAndTrangThai(
            Long studentId,
            Long courseId,
            String trangThai
    );
}
