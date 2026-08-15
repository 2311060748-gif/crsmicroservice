package com.hunre.coursemicroservices.service;

import com.hunre.coursemicroservices.dto.CourseDTO;
import com.hunre.coursemicroservices.entity.Course;
import com.hunre.coursemicroservices.exception.BusinessConflictException;
import com.hunre.coursemicroservices.exception.ResourceNotFoundException;
import com.hunre.coursemicroservices.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseDTO> findAll() {
        return courseRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO getById(Long id) {
        return toDTO(findOrThrow(id));
    }

    @Transactional
    public CourseDTO create(CourseDTO dto) {
        if (courseRepository.existsByTenMonHocIgnoreCase(dto.getTenMonHoc())) {
            throw new BusinessConflictException("Tên môn học đã tồn tại");
        }

        Course course = new Course();
        course.setTenMonHoc(dto.getTenMonHoc());
        course.setSoTinChi(dto.getSoTinChi());
        course.setSoChoToiDa(dto.getSoChoToiDa());
        course.setSoChoDaDangKy(0);

        return toDTO(courseRepository.save(course));
    }

    @Transactional
    public CourseDTO update(Long id, CourseDTO dto) {
        Course course = findOrThrow(id);

        if (courseRepository.existsByTenMonHocIgnoreCaseAndIdNot(dto.getTenMonHoc(), id)) {
            throw new BusinessConflictException("Tên môn học đã tồn tại");
        }
        if (dto.getSoChoToiDa() < course.getSoChoDaDangKy()) {
            throw new BusinessConflictException(
                    "Số chỗ tối đa không được nhỏ hơn số chỗ đã đăng ký ("
                            + course.getSoChoDaDangKy() + ")");
        }

        course.setTenMonHoc(dto.getTenMonHoc());
        course.setSoTinChi(dto.getSoTinChi());
        course.setSoChoToiDa(dto.getSoChoToiDa());

        return toDTO(courseRepository.save(course));
    }

    @Transactional
    public void delete(Long id) {
        Course course = findOrThrow(id);
        if (course.getSoChoDaDangKy() > 0) {
            throw new BusinessConflictException("Môn học vẫn còn sinh viên đăng ký");
        }
        courseRepository.delete(course);
    }

    private Course findOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học"));
    }

    public Page<CourseDTO> search(String keyword, Pageable pageable){
        Page<Course> page = (keyword == null || keyword.isBlank()) ? courseRepository.findAll(pageable)
                : courseRepository.findByTenMonHocContainingIgnoreCase(keyword, pageable);
        return page.map(this::toDTO);
    }

    @Transactional
    public CourseDTO reserveSeat(Long courseId) {
        Course course = findOrThrow(courseId);

        if (course.getSoChoConLai() <= 0) {
            throw new BusinessConflictException(
                    "Môn học đã hết chỗ, không thể giữ thêm chỗ"
            );
        }

        course.setSoChoDaDangKy(
                course.getSoChoDaDangKy() + 1
        );

        return toDTO(courseRepository.save(course));
    }

    @Transactional
    public CourseDTO releaseSeat(Long courseId) {
        Course course = findOrThrow(courseId);

        if (course.getSoChoDaDangKy() <= 0) {
            throw new BusinessConflictException(
                    "Không thể trả chỗ vì số chỗ đã đăng ký đang bằng 0"
            );
        }

        course.setSoChoDaDangKy(
                course.getSoChoDaDangKy() - 1
        );

        return toDTO(courseRepository.save(course));
    }

    private CourseDTO toDTO(Course course) {
        return new CourseDTO(
                course.getId(),
                course.getTenMonHoc(),
                course.getSoTinChi(),
                course.getSoChoToiDa(),
                course.getSoChoDaDangKy(),
                course.getSoChoConLai()
        );
    }
}
