-- Khởi tạo các database cho kiến trúc Microservices (Database-per-Service)
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS course_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS registration_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Cấp quyền truy cập đầy đủ cho user student
GRANT ALL PRIVILEGES ON auth_db.* TO 'student'@'%';
GRANT ALL PRIVILEGES ON course_db.* TO 'student'@'%';
GRANT ALL PRIVILEGES ON registration_db.* TO 'student'@'%';

FLUSH PRIVILEGES;
