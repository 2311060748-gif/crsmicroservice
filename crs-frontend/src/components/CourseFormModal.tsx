import { useEffect, useRef, useState } from 'react'
import type { CourseDTO, CourseRequest } from '../types'
import { createCourse, extractErrorMessage, updateCourse } from '../api/courseApi'

interface CourseFormModalProps {
  /** If provided, we're editing; otherwise creating */
  course: CourseDTO | null
  /** Called after successful save */
  onSaved: () => void
  /** Called when modal should close */
  onClose: () => void
}

const EMPTY_FORM: CourseRequest = {
  tenMonHoc: '',
  soTinChi: 3,
  soChoToiDa: 60,
}

export default function CourseFormModal({
  course,
  onSaved,
  onClose,
}: CourseFormModalProps) {
  const isEdit = course !== null
  const [form, setForm] = useState<CourseRequest>(
    course
      ? { tenMonHoc: course.tenMonHoc, soTinChi: course.soTinChi, soChoToiDa: course.soChoToiDa }
      : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Focus name input on mount
  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (field: keyof CourseRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validate = (): string | null => {
    if (!form.tenMonHoc.trim()) return 'Tên môn học không được để trống.'
    if (form.soTinChi < 1 || form.soTinChi > 10) return 'Số tín chỉ phải từ 1 đến 10.'
    if (form.soChoToiDa < 1) return 'Số chỗ tối đa phải lớn hơn 0.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload: CourseRequest = {
        tenMonHoc: form.tenMonHoc.trim(),
        soTinChi: Number(form.soTinChi),
        soChoToiDa: Number(form.soChoToiDa),
      }

      if (isEdit && course) {
        await updateCourse(course.id, payload)
      } else {
        await createCourse(payload)
      }

      onSaved()
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {isEdit ? '✏️ Sửa môn học' : '➕ Thêm môn học mới'}
          </h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="modal__error" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal__form">
          <div className="form-group">
            <label htmlFor="input-tenMonHoc" className="form-label">
              Tên môn học <span className="form-required">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="input-tenMonHoc"
              className="form-input"
              type="text"
              placeholder="VD: Lập trình Java"
              value={form.tenMonHoc}
              onChange={(e) => handleChange('tenMonHoc', e.target.value)}
              disabled={saving}
              autoComplete="off"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="input-soTinChi" className="form-label">
                Số tín chỉ <span className="form-required">*</span>
              </label>
              <input
                id="input-soTinChi"
                className="form-input"
                type="number"
                min={1}
                max={10}
                value={form.soTinChi}
                onChange={(e) => handleChange('soTinChi', Number(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="input-soChoToiDa" className="form-label">
                Số chỗ tối đa <span className="form-required">*</span>
              </label>
              <input
                id="input-soChoToiDa"
                className="form-input"
                type="number"
                min={1}
                value={form.soChoToiDa}
                onChange={(e) => handleChange('soChoToiDa', Number(e.target.value))}
                disabled={saving}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="btn-spinner" />
                  Đang lưu...
                </>
              ) : isEdit ? (
                'Cập nhật'
              ) : (
                'Thêm mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
