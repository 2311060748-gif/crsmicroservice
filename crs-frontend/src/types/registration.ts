export interface RegistrationRequestDTO {
  studentId: number;
  courseId: number;
}

export interface Registration {
  id: number;
  studentId: number;
  courseId: number;
  trangThai: string;
  ngayDangKy: string;
}
