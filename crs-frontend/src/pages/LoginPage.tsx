import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { extractAuthErrorMessage } from '../api/authApi'

export const LoginPage = () => {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Tab active: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // Form states - Login
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Form states - Register
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regHoTen, setRegHoTen] = useState('')
  const [regMssv, setRegMssv] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/courses'

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.')
      return
    }

    setIsSubmitting(true)
    try {
      await login({
        username: loginUsername.trim(),
        password: loginPassword,
      })
      navigate(from, { replace: true })
    } catch (err) {
      setErrorMsg(extractAuthErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!regUsername.trim() || !regPassword.trim() || !regHoTen.trim() || !regMssv.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin đăng ký.')
      return
    }

    if (regPassword.length < 8) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 8 ký tự.')
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        username: regUsername.trim(),
        password: regPassword,
        hoTen: regHoTen.trim(),
        mssv: regMssv.trim(),
      })
      setSuccessMsg('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      setActiveTab('login')
      setLoginUsername(regUsername.trim())
      setLoginPassword('')
    } catch (err) {
      setErrorMsg(extractAuthErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoCredentials = (u: string, p: string) => {
    setLoginUsername(u)
    setLoginPassword(p)
    setErrorMsg(null)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-card__header">
          <div className="auth-card__logo">🎓</div>
          <h1 className="auth-card__title">HUNRE CRS</h1>
          <p className="auth-card__subtitle">
            Hệ thống Quản lý & Đăng ký Môn học Microservices
          </p>
        </div>

        {/* Tab switch */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tabs__tab ${activeTab === 'login' ? 'auth-tabs__tab--active' : ''}`}
            onClick={() => {
              setActiveTab('login')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`auth-tabs__tab ${activeTab === 'register' ? 'auth-tabs__tab--active' : ''}`}
            onClick={() => {
              setActiveTab('register')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
          >
            Đăng ký Sinh viên
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div className="auth-alert auth-alert--error">
            <span className="auth-alert__icon">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert auth-alert--success">
            <span className="auth-alert__icon">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-username" className="form-label">
                Tên đăng nhập
              </label>
              <input
                id="login-username"
                type="text"
                className="form-input"
                placeholder="Nhập tên đăng nhập..."
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Mật khẩu
              </label>
              <div className="auth-input-password-wrapper">
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Nhập mật khẩu..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  tabIndex={-1}
                  title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showLoginPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small" /> Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>

            {/* Demo Quick Fill */}
            <div className="auth-demo-section">
              <span className="auth-demo-label">Tài khoản demo nhanh:</span>
              <div className="auth-demo-buttons">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => fillDemoCredentials('admin01', 'admin-password')}
                  title="Điền tài khoản Quản trị viên (Toàn quyền CRUD)"
                >
                  👑 Admin (admin01)
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => fillDemoCredentials('student01', 'password123')}
                  title="Điền tài khoản Sinh viên (Chỉ xem)"
                >
                  🎓 Sinh viên (student01)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="reg-username" className="form-label">
                Tên đăng nhập <span className="text-danger">*</span>
              </label>
              <input
                id="reg-username"
                type="text"
                className="form-input"
                placeholder="Ví dụ: sv_nguyenvana"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">
                Mật khẩu (tối thiểu 8 ký tự) <span className="text-danger">*</span>
              </label>
              <div className="auth-input-password-wrapper">
                <input
                  id="reg-password"
                  type={showRegPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Nhập mật khẩu..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowRegPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showRegPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-hoten" className="form-label">
                  Họ và tên <span className="text-danger">*</span>
                </label>
                <input
                  id="reg-hoten"
                  type="text"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={regHoTen}
                  onChange={(e) => setRegHoTen(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-mssv" className="form-label">
                  Mã sinh viên (MSSV) <span className="text-danger">*</span>
                </label>
                <input
                  id="reg-mssv"
                  type="text"
                  className="form-input"
                  placeholder="2311060748"
                  value={regMssv}
                  onChange={(e) => setRegMssv(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small" /> Đang đăng ký...
                </>
              ) : (
                'Đăng ký tài khoản Sinh viên'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginPage
