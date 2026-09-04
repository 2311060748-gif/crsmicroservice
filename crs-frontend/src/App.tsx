import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import CourseList from './components/CourseList'
import LoginPage from './pages/LoginPage'
import ApiKeysPage from './pages/ApiKeysPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang Đăng nhập & Đăng ký */}
          <Route path="/login" element={<LoginPage />} />

          {/* Tuyến đường bảo vệ: Danh sách Môn học */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Navbar />
                  <main className="app-main">
                    <CourseList />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Tuyến đường bảo vệ ADMIN: Quản lý API Key */}
          <Route
            path="/admin/api-keys"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <div className="app-layout">
                  <Navbar />
                  <main className="app-main">
                    <ApiKeysPage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Chuyển hướng mặc định */}
          <Route path="/" element={<Navigate to="/courses" replace />} />

          {/* Tuyến đường 404 */}
          <Route
            path="*"
            element={
              <div className="not-found-page">
                <div className="not-found-card">
                  <span className="not-found-card__emoji">🧭</span>
                  <h1 className="not-found-card__code">404</h1>
                  <p className="not-found-card__text">
                    Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
                  </p>
                  <a href="/courses" className="btn btn--primary">
                    Quay lại Trang chủ
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
