import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createApiKey,
  extractApiKeyErrorMessage,
  fetchApiKeys,
  revokeApiKey,
  verifyApiKey,
} from '../api/apiKeyApi'
import { ToastContainer, useToast } from '../components/Toast'
import type {
  ApiKey,
  CreatedApiKeyResponse,
  VerifyApiKeyResponse,
} from '../types'

const AVAILABLE_SCOPES = [
  { id: 'COURSES:READ', label: 'Xem môn học', desc: 'GET /api/courses/**' },
  { id: 'COURSES:WRITE', label: 'Quản lý môn học', desc: 'POST, PUT, DELETE /api/courses/**' },
  { id: 'REGISTRATIONS:READ', label: 'Xem đăng ký', desc: 'GET /api/registrations/**' },
  { id: 'REGISTRATIONS:WRITE', label: 'Đăng ký & Hủy học phần', desc: 'POST, DELETE /api/registrations/**' },
  { id: 'INTERNAL:SEAT', label: 'Giữ & Trả chỗ nội bộ', desc: 'PATCH /internal/courses/**' },
  { id: '*', label: 'Toàn quyền (Admin/All)', desc: 'Tất cả các endpoint' },
]

export const ApiKeysPage = () => {
  const { toasts, addToast, removeToast } = useToast()

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createdKeyData, setCreatedKeyData] = useState<CreatedApiKeyResponse | null>(null)
  const [copied, setCopied] = useState(false)

  // Create form state
  const [keyName, setKeyName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['COURSES:READ'])
  const [expirationDays, setExpirationDays] = useState<number | null>(30)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tester state
  const [showTester, setShowTester] = useState(false)
  const [testKey, setTestKey] = useState('')
  const [testScope, setTestScope] = useState('COURSES:READ')
  const [testResult, setTestResult] = useState<VerifyApiKeyResponse | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const loadKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchApiKeys()
      setKeys(data)
    } catch (err) {
      setError(extractApiKeyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadKeys()
  }, [loadKeys])

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId)
        ? prev.filter((s) => s !== scopeId)
        : [...prev, scopeId]
    )
  }

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!keyName.trim()) {
      addToast('error', 'Vui lòng nhập tên định danh cho API Key.')
      return
    }
    if (selectedScopes.length === 0) {
      addToast('error', 'Vui lòng chọn ít nhất một quyền (scope).')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createApiKey({
        name: keyName.trim(),
        scopes: selectedScopes,
        expirationDays: expirationDays && expirationDays > 0 ? expirationDays : null,
      })
      setCreatedKeyData(res)
      setIsCreateOpen(false)
      setKeyName('')
      setSelectedScopes(['COURSES:READ'])
      setExpirationDays(30)
      addToast('success', 'Cấp API Key mới thành công!')
      loadKeys()
    } catch (err) {
      addToast('error', extractApiKeyErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevoke = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thu hồi API Key "${name}"? Hành động này không thể hoàn tác.`)) {
      return
    }
    try {
      await revokeApiKey(id)
      addToast('success', `Đã thu hồi API Key "${name}" thành công.`)
      loadKeys()
    } catch (err) {
      addToast('error', extractApiKeyErrorMessage(err))
    }
  }

  const handleCopyKey = () => {
    if (createdKeyData?.rawKey) {
      navigator.clipboard.writeText(createdKeyData.rawKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
      addToast('info', 'Đã sao chép API Key vào bộ nhớ tạm!')
    }
  }

  const handleTestKey = async (e: FormEvent) => {
    e.preventDefault()
    if (!testKey.trim()) {
      addToast('error', 'Vui lòng nhập API Key cần kiểm tra.')
      return
    }

    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await verifyApiKey({
        apiKey: testKey.trim(),
        requiredScope: testScope || undefined,
      })
      setTestResult(res)
    } catch (err) {
      addToast('error', extractApiKeyErrorMessage(err))
    } finally {
      setIsTesting(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Không thời hạn'
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const activeCount = keys.filter((k) => k.status === 'ACTIVE').length
  const revokedCount = keys.filter((k) => k.status === 'REVOKED').length

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="page-header">
        <span className="page-header__icon">🔑</span>
        <h1 className="page-header__title">Quản lý API Key</h1>
        <p className="page-header__subtitle">
          Cấp phát, thu hồi và phân quyền theo phạm vi API (Scopes) cho các dịch vụ & đối tác
        </p>
      </header>

      {/* Stats Bar */}
      <div className="apikey-stats">
        <div className="apikey-stat-card">
          <span className="apikey-stat-card__label">Tổng số Key</span>
          <span className="apikey-stat-card__value">{keys.length}</span>
        </div>
        <div className="apikey-stat-card">
          <span className="apikey-stat-card__label">Đang hoạt động</span>
          <span className="apikey-stat-card__value apikey-stat-card__value--active">
            {activeCount}
          </span>
        </div>
        <div className="apikey-stat-card">
          <span className="apikey-stat-card__label">Đã thu hồi</span>
          <span className="apikey-stat-card__value apikey-stat-card__value--revoked">
            {revokedCount}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setIsCreateOpen(true)}
          >
            ➕ Cấp API Key mới
          </button>
          <button
            type="button"
            className={`btn btn--ghost ${showTester ? 'btn--ghost-active' : ''}`}
            onClick={() => setShowTester((prev) => !prev)}
          >
            🧪 {showTester ? 'Ẩn công cụ kiểm tra' : 'Kiểm tra API Key'}
          </button>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={loadKeys}
          title="Tải lại danh sách"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Tester Tool Panel */}
      {showTester && (
        <div className="apikey-tester-panel">
          <h3 className="apikey-tester-panel__title">🧪 Công cụ Kiểm tra API Key (Scope Tester)</h3>
          <form onSubmit={handleTestKey} className="apikey-tester-form">
            <div className="form-group flex-2">
              <label className="form-label">Nhập API Key cần kiểm tra:</label>
              <input
                type="text"
                className="form-input"
                placeholder="crs_live_..."
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Phạm vi quyền (Scope) cần test:</label>
              <select
                className="form-input"
                value={testScope}
                onChange={(e) => setTestScope(e.target.value)}
              >
                {AVAILABLE_SCOPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} ({s.label})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn btn--primary apikey-tester-submit"
              disabled={isTesting}
            >
              {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
            </button>
          </form>

          {testResult && (
            <div
              className={`apikey-tester-result ${
                testResult.valid && testResult.hasRequiredScope
                  ? 'apikey-tester-result--valid'
                  : 'apikey-tester-result--invalid'
              }`}
            >
              <span className="apikey-tester-result__icon">
                {testResult.valid && testResult.hasRequiredScope ? '✅' : '❌'}
              </span>
              <div className="apikey-tester-result__info">
                <strong>{testResult.message}</strong>
                {testResult.keyName && <span> — Tên Key: <em>{testResult.keyName}</em></span>}
                {testResult.scopes && (
                  <div className="apikey-scope-list mt-1">
                    <span>Các quyền sở hữu:</span>
                    {testResult.scopes.map((s) => (
                      <span key={s} className="badge badge--scope">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button className="error-banner__retry" onClick={loadKeys}>
            Thử lại
          </button>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="state-container">
            <div className="spinner" />
            <p className="state-container__title">Đang tải danh sách API Key...</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="state-container">
            <span className="state-container__icon">🗝️</span>
            <p className="state-container__title">Chưa có API Key nào được cấp</p>
            <p className="state-container__message">
              Bấm nút &quot;Cấp API Key mới&quot; để tạo khóa truy cập cho ứng dụng hoặc đối tác tích hợp.
            </p>
          </div>
        ) : (
          <table className="course-table">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th>Tên định danh</th>
                <th>Mã nhận diện (Prefix)</th>
                <th>Phạm vi quyền (Scopes)</th>
                <th>Ngày hết hạn</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k, idx) => (
                <tr key={k.id}>
                  <td className="text-center">{idx + 1}</td>
                  <td>
                    <span className="course-name">{k.name}</span>
                    <span className="text-muted block text-xs">Tạo bởi: {k.createdBy}</span>
                  </td>
                  <td>
                    <code className="apikey-prefix-code">{k.keyPrefix}</code>
                  </td>
                  <td>
                    <div className="apikey-scope-list">
                      {k.scopes.map((scope) => (
                        <span key={scope} className="badge badge--scope">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{formatDate(k.expiresAt)}</td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        k.status === 'ACTIVE'
                          ? 'badge--success'
                          : k.status === 'REVOKED'
                          ? 'badge--danger'
                          : 'badge--neutral'
                      }`}
                    >
                      {k.status === 'ACTIVE'
                        ? '🟢 Hoạt động'
                        : k.status === 'REVOKED'
                        ? '🔴 Đã thu hồi'
                        : '⚪ Đã hết hạn'}
                    </span>
                  </td>
                  <td className="text-center">
                    {k.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        className="btn btn--danger btn--xs"
                        onClick={() => handleRevoke(k.id, k.name)}
                        title="Thu hồi quyền truy cập của API Key này"
                      >
                        🚫 Thu hồi
                      </button>
                    ) : (
                      <span className="text-muted text-xs">Vô hiệu hóa</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Create API Key */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal modal--md" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">➕ Cấp API Key mới</h2>
              <button
                type="button"
                className="modal__close"
                onClick={() => setIsCreateOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">
                    Tên ứng dụng / Đối tác <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: CRS Mobile App, Đối tác Tuyển sinh..."
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mt-3">
                  <label className="form-label">
                    Phân quyền theo API (Scopes) <span className="text-danger">*</span>
                  </label>
                  <div className="apikey-scope-checkboxes">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <label key={scope.id} className="apikey-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope.id)}
                          onChange={() => handleScopeToggle(scope.id)}
                        />
                        <div className="apikey-checkbox-text">
                          <span className="apikey-checkbox-name">
                            <code>{scope.id}</code> — {scope.label}
                          </span>
                          <span className="apikey-checkbox-desc">{scope.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label className="form-label">Thời hạn sử dụng</label>
                  <select
                    className="form-input"
                    value={expirationDays === null ? '0' : expirationDays}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setExpirationDays(val === 0 ? null : val)
                    }}
                  >
                    <option value="30">30 ngày (Khuyến nghị)</option>
                    <option value="90">90 ngày (3 tháng)</option>
                    <option value="365">1 năm</option>
                    <option value="0">Vĩnh viễn (Không hết hạn)</option>
                  </select>
                </div>
              </div>

              <div className="modal__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo API Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Secret Key Created (Show Once) */}
      {createdKeyData && (
        <div className="modal-overlay" onClick={() => setCreatedKeyData(null)}>
          <div
            className="modal modal--md apikey-secret-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <div className="modal__header-title-group">
                <span className="modal__icon">🎉</span>
                <h2 className="modal__title">API Key đã được tạo thành công</h2>
              </div>
              <button
                type="button"
                className="modal__close"
                onClick={() => setCreatedKeyData(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="auth-alert auth-alert--warning">
                <span className="auth-alert__icon">⚠️</span>
                <span>
                  <strong>Cực kỳ quan trọng:</strong> Khóa bí mật chỉ hiển thị <strong>một lần duy nhất</strong>. Hãy sao chép và lưu vào nơi an toàn trước khi đóng hộp thoại này.
                </span>
              </div>

              <div className="apikey-copy-box">
                <input
                  type="text"
                  className="apikey-copy-box__input"
                  readOnly
                  value={createdKeyData.rawKey}
                />
                <button
                  type="button"
                  className="btn btn--primary apikey-copy-box__btn"
                  onClick={handleCopyKey}
                >
                  {copied ? '✅ Đã chép' : '📋 Sao chép'}
                </button>
              </div>

              <div className="apikey-created-meta mt-3">
                <p><strong>Tên Key:</strong> {createdKeyData.name}</p>
                <p><strong>Hạn dùng:</strong> {formatDate(createdKeyData.expiresAt)}</p>
                <p>
                  <strong>Quyền hạn:</strong>{' '}
                  {createdKeyData.scopes.map((s) => (
                    <span key={s} className="badge badge--scope mr-1">
                      {s}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setCreatedKeyData(null)}
              >
                Tôi đã lưu khóa an toàn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiKeysPage
