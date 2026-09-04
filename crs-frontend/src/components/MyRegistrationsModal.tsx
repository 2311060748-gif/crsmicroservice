import { useState } from 'react'
import type { CourseDTO, Registration } from '../types'

interface MyRegistrationsModalProps {
  isOpen: boolean
  onClose: () => void
  registrations: Registration[]
  courses: CourseDTO[]
  onCancel: (registrationId: number, courseName: string) => Promise<void>
  isLoading?: boolean
}

export const MyRegistrationsModal = ({
  isOpen,
  onClose,
  registrations,
  courses,
  onCancel,
  isLoading = false,
}: MyRegistrationsModalProps) => {
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  if (!isOpen) return null

  // Chi lay nhung dang ky co trang thai DA_DANG_KY
  const activeRegistrations = registrations.filter(
    (r) => r.trangThai === 'DA_DANG_KY'
  )

  // Map courseId -> CourseDTO
  const courseMap = new Map<number, CourseDTO>()
  courses.forEach((c) => courseMap.set(c.id, c))

  // Tinh tong so tin chi
  const totalCredits = activeRegistrations.reduce((sum, reg) => {
    const course = courseMap.get(reg.courseId)
    return sum + (course ? course.soTinChi : 0)
  }, 0)

  const handleCancelClick = async (regId: number, courseName: string) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đăng ký học phần "${courseName}"?`)) {
      return
    }
    setCancellingId(regId)
    try {
      await onCancel(regId, courseName)
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <div className="modal__header-title-group">
            <span className="modal__icon">📋</span>
            <h2 className="modal__title">Học phần đã đăng ký</h2>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Đóng modal"
          >
            ✕
          </button>
        </div>

        <div className="modal__body">
          {/* Summary bar */}
          <div className="reg-summary-bar">
            <div className="reg-summary-item">
              <span className="reg-summary-label">Số môn học</span>
              <span className="reg-summary-value">{activeRegistrations.length}</span>
            </div>
            <div className="reg-summary-item">
              <span className="reg-summary-label">Tổng tín chỉ tích lũy</span>
              <span className="reg-summary-value reg-summary-value--highlight">
                {totalCredits} TC
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="state-container">
              <div className="spinner" />
              <p className="state-container__title">Đang tải học phần...</p>
            </div>
          ) : activeRegistrations.length === 0 ? (
            <div className="state-container">
              <span className="state-container__icon">🎓</span>
              <p className="state-container__title">Chưa đăng ký môn học nào</p>
              <p className="state-container__message">
                Hãy chọn các môn học còn chỗ trong danh sách để tiến hành đăng ký.
              </p>
            </div>
          ) : (
            <div className="table-wrapper reg-table-wrapper">
              <table className="course-table">
                <thead>
                  <tr>
                    <th className="text-center">#</th>
                    <th>Tên môn học</th>
                    <th className="text-center">Số TC</th>
                    <th>Thời gian đăng ký</th>
                    <th className="text-center">Trạng thái</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRegistrations.map((reg, idx) => {
                    const course = courseMap.get(reg.courseId)
                    const courseName = course ? course.tenMonHoc : `Môn học #${reg.courseId}`
                    const credits = course ? course.soTinChi : '—'

                    return (
                      <tr key={reg.id}>
                        <td className="text-center">{idx + 1}</td>
                        <td>
                          <span className="course-name">{courseName}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge badge--credit">{credits}</span>
                        </td>
                        <td className="reg-date-cell">
                          {formatDate(reg.ngayDangKy)}
                        </td>
                        <td className="text-center">
                          <span className="badge badge--success">
                            Đã đăng ký
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => handleCancelClick(reg.id, courseName)}
                            disabled={cancellingId === reg.id}
                            title="Hủy đăng ký học phần này"
                          >
                            {cancellingId === reg.id ? (
                              <span className="spinner-small" />
                            ) : (
                              '❌ Hủy'
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyRegistrationsModal
