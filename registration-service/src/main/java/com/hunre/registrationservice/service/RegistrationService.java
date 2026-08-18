package com.hunre.registrationservice.service;

import com.hunre.registrationservice.client.CourseClient;
import com.hunre.registrationservice.dto.RegistrationRequestDTO;
import com.hunre.registrationservice.entity.Registration;
import com.hunre.registrationservice.exception.BusinessConflictException;
import com.hunre.registrationservice.exception.ResourceNotFoundException;
import com.hunre.registrationservice.repository.RegistrationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private static final String DA_DANG_KY = "DA_DANG_KY";
    private static final String DA_HUY = "DA_HUY";

    private final RegistrationRepository registrationRepository;
    private final CourseClient courseClient;

    public Page<Registration> findAll(Pageable pageable) {
        return registrationRepository.findAll(pageable);
    }

    public Registration getById(Long id) {
        return findOrThrow(id);
    }

    public Page<Registration> findByStudentId(
            Long studentId,
            Pageable pageable
    ) {
        return registrationRepository.findByStudentId(studentId, pageable);
    }

    public Page<Registration> findByCourseId(
            Long courseId,
            Pageable pageable
    ) {
        return registrationRepository.findByCourseId(courseId, pageable);
    }

    @Transactional
    public Registration register(RegistrationRequestDTO dto) {

        boolean daDangKy =
                registrationRepository
                        .existsByStudentIdAndCourseIdAndTrangThai(
                                dto.getStudentId(),
                                dto.getCourseId(),
                                DA_DANG_KY
                        );

        if (daDangKy) {
            throw new BusinessConflictException(
                    "Bạn đã đăng ký môn học này"
            );
        }

        // Course-service giữ 1 chỗ trước.
        courseClient.reserveSeat(dto.getCourseId());

        // Giữ chỗ thành công mới tạo đăng ký.
        Registration registration = new Registration();

        registration.setStudentId(dto.getStudentId());
        registration.setCourseId(dto.getCourseId());
        registration.setTrangThai(DA_DANG_KY);
        registration.setNgayDangKy(LocalDateTime.now());

        return registrationRepository.save(registration);
    }

    @Transactional
    public void cancel(Long registrationId) {

        Registration registration = findOrThrow(registrationId);

        if (DA_HUY.equals(registration.getTrangThai())) {
            throw new BusinessConflictException(
                    "Đăng ký này đã được hủy trước đó"
            );
        }

        // Trả chỗ cho course-service trước.
        courseClient.releaseSeat(
                registration.getCourseId()
        );

        registration.setTrangThai(DA_HUY);

        registrationRepository.save(registration);
    }

    private Registration findOrThrow(Long id) {
        return registrationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đăng ký"
                        )
                );
    }
}
