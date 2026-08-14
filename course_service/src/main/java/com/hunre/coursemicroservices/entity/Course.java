package com.hunre.coursemicroservices.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "courses")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_mon_hoc", nullable = false, length = 200)
    private String tenMonHoc;

    @Column(name = "so_tin_chi", nullable = false)
    private Integer soTinChi;

    @Column(name = "so_cho_toi_da", nullable = false)
    private Integer soChoToiDa;

    @Column(name = "so_cho_da_dang_ky", nullable = false)
    @Builder.Default
    private Integer soChoDaDangKy = 0;

    /**
     * Chỗ còn lại không lưu trong DB, tính ra khi cần.
     */
    public int getSoChoConLai() {
        return soChoToiDa - soChoDaDangKy;
    }
}
