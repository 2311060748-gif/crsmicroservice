package com.hunre.coursemicroservices.repository;

import com.hunre.coursemicroservices.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByTenMonHocIgnoreCase(String tenMonHoc);
    boolean existsByTenMonHocIgnoreCaseAndIdNot(String tenMonHoc, Long id);

    Page<Course> findByTenMonHocContainingIgnoreCase(String keyword, Pageable pageable);
}
