package com.hunre.authservice.repository;

import com.hunre.authservice.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByMssv(String mssv);
    Optional<Student> findByUserUsername(String username);
}
