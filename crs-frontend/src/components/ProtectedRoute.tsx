import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: Role
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner" />
        <p className="app-loading-text">Đang tải thông tin xác thực...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <div className="access-denied-icon">🚫</div>
          <h2 className="access-denied-title">Truy cập bị từ chối</h2>
          <p className="access-denied-desc">
            Bạn không có quyền quản trị viên ({requiredRole}) để xem trang này.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.history.back()}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
