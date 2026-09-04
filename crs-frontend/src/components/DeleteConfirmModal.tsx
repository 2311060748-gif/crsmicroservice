import { useEffect, useState } from 'react'
import type { CourseDTO } from '../types'
import { deleteCourse, extractErrorMessage } from '../api/courseApi'

interface DeleteConfirmModalProps {
  course: CourseDTO
  onDeleted: () => void
  onClose: () => void
}

export default function DeleteConfirmModal({
  course,
  onDeleted,
  onClose,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      await deleteCourse(course.id)
      onDeleted()
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--sm"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
      >
        {/* Header */}
        <div className="modal__header">
          <h2 id="delete-title" className="modal__title modal__title--danger">
            🗑️ Xác nhận xóa
          </h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          <p id="delete-desc" className="delete-message">
            Bạn có chắc chắn muốn xóa môn học{' '}
            <strong>"{course.tenMonHoc}"</strong>?
          </p>
          {course.soChoDaDangKy > 0 && (
            <div className="delete-warning">
              ⚠️ Môn học này hiện có <strong>{course.soChoDaDangKy}</strong> sinh viên
              đã đăng ký. Không thể xóa khi vẫn còn người đăng ký.
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="modal__error" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div className="modal__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onClose}
            disabled={deleting}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={handleDelete}
            disabled={deleting || course.soChoDaDangKy > 0}
          >
            {deleting ? (
              <>
                <span className="btn-spinner" />
                Đang xóa...
              </>
            ) : (
              'Xóa môn học'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
