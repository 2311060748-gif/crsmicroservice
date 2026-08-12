package com.hunre.authservice.repository;

import com.hunre.authservice.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByMssv(String mssv);
}
