package com.hunre.coursemicroservices.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank(message = "Tên môn học không được để trống")
    private String tenMonHoc;

    @NotNull(message = "Số tín chỉ không được để trống")
    @Min(value = 1, message = "Số tín chỉ phải lớn hơn 0")
    private Integer soTinChi;

    @NotNull(message = "Số chỗ tối đa không được để trống")
    @Min(value = 1, message = "Số chỗ tối đa phải lớn hơn 0")
    private Integer soChoToiDa;

    /**
     * Do course-service tự quản, client không gửi lên được.
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer soChoDaDangKy;

    /**
     * Tính từ soChoToiDa - soChoDaDangKy, không lưu trong DB.
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer soChoConLai;
}
