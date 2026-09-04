import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCourses } from '../hooks/useCourses'
import { useAuth } from '../context/AuthContext'
import CourseFormModal from './CourseFormModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import { ToastContainer, useToast } from './Toast'
import type { CourseDTO } from '../types'

/* ================================================================
   Helper: build an array of page numbers with ellipsis markers
   ================================================================ */
function buildPageRange(
  currentPage: number,
  totalPages: number,
  delta = 1
): (number | '...')[] {
  if (totalPages <= 1) return []

  const range: (number | '...')[] = []
  const left = Math.max(0, currentPage - delta)
  const right = Math.min(totalPages - 1, currentPage + delta)

  // Always show first page
  if (left > 0) {
    range.push(0)
    if (left > 1) range.push('...')
  }

  for (let i = left; i <= right; i++) {
    range.push(i)
  }

  // Always show last page
  if (right < totalPages - 1) {
    if (right < totalPages - 2) range.push('...')
    range.push(totalPages - 1)
  }

  return range
}

/* ================================================================
   Seat fill helpers
   ================================================================ */
function getSeatPercentage(registered: number, max: number): number {
  if (max === 0) return 100
  return Math.round((registered / max) * 100)
}

function getSeatLevel(pct: number): 'low' | 'medium' | 'high' {
  if (pct >= 90) return 'high'
  if (pct >= 60) return 'medium'
  return 'low'
}

/* ================================================================
   Modal state types
   ================================================================ */
type ModalState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; course: CourseDTO }
  | { kind: 'delete'; course: CourseDTO }

/* ================================================================
   Component
   ================================================================ */
export default function CourseList() {
  const {
    data,
    loading,
    error,
    keyword,
    page,
    pageSize,
    setKeyword,
    setPage,
    setPageSize,
    refetch,
  } = useCourses({ initialSize: 10 })

  const { toasts, addToast, removeToast } = useToast()
  const { isAdmin, user } = useAuth()
  const [modal, setModal] = useState<ModalState>({ kind: 'closed' })

  // Lang nghe su kien 403 tu axios interceptor
  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string }>).detail
      addToast('error', detail?.message || 'Bạn không có quyền thực hiện thao tác này.')
    }
    window.addEventListener('auth:forbidden', handleForbidden)
    return () => {
      window.removeEventListener('auth:forbidden', handleForbidden)
    }
  }, [addToast])

  const pageRange = useMemo(
    () => buildPageRange(page, data?.totalPages ?? 0, 2),
    [page, data?.totalPages]
  )

  /* ---------- Row index helper ---------- */
  const rowIndex = (i: number) => page * pageSize + i + 1

  /* ---------- Modal handlers ---------- */
  const closeModal = useCallback(() => setModal({ kind: 'closed' }), [])

  const handleCreated = useCallback(() => {
    closeModal()
    addToast('success', 'Thêm môn học thành công!')
    refetch()
  }, [closeModal, addToast, refetch])

  const handleUpdated = useCallback(() => {
    closeModal()
    addToast('success', 'Cập nhật môn học thành công!')
    refetch()
  }, [closeModal, addToast, refetch])

  const handleDeleted = useCallback(() => {
    closeModal()
    addToast('success', 'Xóa môn học thành công!')
    refetch()
  }, [closeModal, addToast, refetch])

  return (
    <div className="app-container">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ---- Header ---- */}
      <header className="page-header">
        <span className="page-header__icon">📚</span>
        <h1 className="page-header__title">Danh sách Môn học</h1>
        <p className="page-header__subtitle">
          Tìm kiếm và quản lý các môn học trong hệ thống
        </p>
      </header>

      {/* ---- Toolbar: Search + Add (Role Based) ---- */}
      <div className="toolbar">
        <div className="toolbar__search search-bar">
          <span className="search-bar__icon">🔍</span>
          <input
            id="search-input"
            className="search-bar__input"
            type="text"
            placeholder="Tìm kiếm theo tên môn học..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            autoComplete="off"
          />
          {keyword && (
            <button
              className="search-bar__clear"
              onClick={() => setKeyword('')}
              aria-label="Xóa tìm kiếm"
              title="Xóa"
            >
              ✕
            </button>
          )}
        </div>

        {isAdmin ? (
          <button
            id="btn-add-course"
            className="btn btn--primary"
            onClick={() => setModal({ kind: 'create' })}
          >
            ➕ Thêm môn học
          </button>
        ) : (
          <div className="toolbar__role-badge">
            <span className="badge badge--neutral">
              🎓 Sinh viên: <strong>{user?.username}</strong> (Chế độ xem)
            </span>
          </div>
        )}
      </div>

      {/* ---- Error ---- */}
      {error && (
        <div className="error-banner" role="alert">
          <span className="error-banner__icon">⚠️</span>
          <span>{error}</span>
          <button className="error-banner__retry" onClick={refetch}>
            Thử lại
          </button>
        </div>
      )}

      {/* ---- Stats bar ---- */}
      {data && !error && (
        <div className="stats-bar">
          <span className="stats-bar__count">
            Tổng cộng <strong>{data.totalElements}</strong> môn học
            {keyword && (
              <>
                {' '}
                — kết quả cho &ldquo;<em>{keyword}</em>&rdquo;
              </>
            )}
          </span>
          <div className="stats-bar__page-size">
            <label htmlFor="page-size-select">Hiển thị:</label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* ---- Table ---- */}
      <div className="table-wrapper">
        {loading ? (
          <div className="state-container">
            <div className="spinner" />
            <p className="state-container__title">Đang tải dữ liệu...</p>
          </div>
        ) : !data || data.empty ? (
          <div className="state-container">
            <span className="state-container__icon">📭</span>
            <p className="state-container__title">Không tìm thấy môn học</p>
            <p className="state-container__message">
              {keyword
                ? `Không có kết quả nào cho "${keyword}". Hãy thử từ khóa khác.`
                : 'Chưa có môn học nào trong hệ thống.'}
            </p>
          </div>
        ) : (
          <table className="course-table">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th>Tên môn học</th>
                <th className="text-center">Số tín chỉ</th>
                <th className="text-center">Sĩ số</th>
                <th className="text-center">Còn lại</th>
                <th className="text-center">{isAdmin ? 'Thao tác' : 'Chế độ'}</th>
              </tr>
            </thead>
            <tbody key={`${page}-${keyword}`}>
              {data.content.map((course, idx) => {
                const pct = getSeatPercentage(
                  course.soChoDaDangKy,
                  course.soChoToiDa
                )
                const level = getSeatLevel(pct)

                return (
                  <tr key={course.id}>
                    <td className="text-center">{rowIndex(idx)}</td>
                    <td>
                      <span className="course-name">{course.tenMonHoc}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge badge--credit">
                        {course.soTinChi}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="seat-status">
                        <div className="seat-status__bar">
                          <div
                            className={`seat-status__fill seat-status__fill--${level}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="seat-status__text">
                          {course.soChoDaDangKy}/{course.soChoToiDa}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        className="badge"
                        style={{
                          background:
                            course.soChoConLai === 0
                              ? 'rgba(251, 113, 133, 0.15)'
                              : 'rgba(52, 211, 153, 0.15)',
                          color:
                            course.soChoConLai === 0
                              ? 'var(--accent-rose)'
                              : 'var(--accent-green)',
                        }}
                      >
                        {course.soChoConLai === 0 ? 'Hết' : course.soChoConLai}
                      </span>
                    </td>
                    <td className="text-center">
                      {isAdmin ? (
                        <div className="actions-cell">
                          <button
                            className="btn-icon btn-icon--edit"
                            title="Sửa"
                            aria-label={`Sửa ${course.tenMonHoc}`}
                            onClick={() =>
                              setModal({ kind: 'edit', course })
                            }
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-icon--delete"
                            title="Xóa"
                            aria-label={`Xóa ${course.tenMonHoc}`}
                            onClick={() =>
                              setModal({ kind: 'delete', course })
                            }
                          >
                            🗑️
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge--neutral">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ---- Pagination ---- */}
      {data && data.totalPages > 1 && (
        <nav className="pagination" aria-label="Phân trang">
          {/* Prev */}
          <button
            className="pagination__btn"
            disabled={data.first}
            onClick={() => setPage(page - 1)}
            aria-label="Trang trước"
          >
            ‹
          </button>

          {/* Page numbers */}
          {pageRange.map((item, idx) =>
            item === '...' ? (
              <span key={`ellipsis-${idx}`} className="pagination__ellipsis">
                …
              </span>
            ) : (
              <button
                key={item}
                className={`pagination__btn ${
                  item === page ? 'pagination__btn--active' : ''
                }`}
                onClick={() => setPage(item)}
                aria-current={item === page ? 'page' : undefined}
              >
                {item + 1}
              </button>
            )
          )}

          {/* Next */}
          <button
            className="pagination__btn"
            disabled={data.last}
            onClick={() => setPage(page + 1)}
            aria-label="Trang sau"
          >
            ›
          </button>
        </nav>
      )}

      {/* ---- Modals ---- */}
      {modal.kind === 'create' && (
        <CourseFormModal
          course={null}
          onSaved={handleCreated}
          onClose={closeModal}
        />
      )}

      {modal.kind === 'edit' && (
        <CourseFormModal
          course={modal.course}
          onSaved={handleUpdated}
          onClose={closeModal}
        />
      )}

      {modal.kind === 'delete' && (
        <DeleteConfirmModal
          course={modal.course}
          onDeleted={handleDeleted}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
