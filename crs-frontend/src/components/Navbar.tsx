import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isCoursesActive = location.pathname.startsWith('/courses')
  const isApiKeysActive = location.pathname.startsWith('/admin/api-keys')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U'

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/courses" className="navbar__brand">
          <div className="navbar__logo">🎓</div>
          <div className="navbar__title-group">
            <span className="navbar__title">HUNRE CRS</span>
            <span className="navbar__subtitle">Quản lý Đăng ký Môn học</span>
          </div>
        </Link>

        <nav className="navbar__nav">
          <Link
            to="/courses"
            className={`navbar__nav-link ${isCoursesActive ? 'navbar__nav-link--active' : ''}`}
          >
            📚 Môn học
          </Link>
          {isAdmin && (
            <Link
              to="/admin/api-keys"
              className={`navbar__nav-link ${isApiKeysActive ? 'navbar__nav-link--active' : ''}`}
            >
              🔑 Quản lý API Key
            </Link>
          )}
        </nav>

        <div className="navbar__actions">
          {user && (
            <div className="navbar__user-profile">
              <div className="navbar__avatar">{initial}</div>
              <div className="navbar__user-meta">
                <span className="navbar__username">{user.username}</span>
                <span
                  className={`navbar__role-badge ${
                    isAdmin ? 'navbar__role-badge--admin' : 'navbar__role-badge--user'
                  }`}
                >
                  {isAdmin ? '👑 Quản trị viên' : '🎓 Sinh viên'}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn--ghost navbar__logout-btn"
            onClick={handleLogout}
            title="Đăng xuất khỏi hệ thống"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
