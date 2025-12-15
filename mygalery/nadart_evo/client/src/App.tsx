import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Public pages
const HomePage = lazy(() => import('./pages/HomePage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const ResumePage = lazy(() => import('./pages/ResumePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))

// Admin pages
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const GalleriesPage = lazy(() => import('./pages/admin/GalleriesPage'))
const PaintingsPage = lazy(() => import('./pages/admin/PaintingsPage'))
const ResumeEditPage = lazy(() => import('./pages/admin/ResumeEditPage'))
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="gallery/:slug" element={<GalleryPage />} />
          <Route path="resume" element={<ResumePage />} />
        </Route>

        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="galleries" element={<GalleriesPage />} />
          <Route path="paintings" element={<PaintingsPage />} />
          <Route path="resume" element={<ResumeEditPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
