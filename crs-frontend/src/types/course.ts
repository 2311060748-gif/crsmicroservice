export interface CourseDTO {
  readonly id: number;
  tenMonHoc: string;
  soTinChi: number;
  soChoToiDa: number;
  readonly soChoDaDangKy: number;
  readonly soChoConLai: number;
}

export interface CourseRequest {
  tenMonHoc: string;
  soTinChi: number;
  soChoToiDa: number;
}
