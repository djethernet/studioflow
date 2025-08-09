import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContextProvider'
import { LoginPage } from './components/Auth/LoginPage'
import { SignupPage } from './components/Auth/SignupPage'
import { ResetPasswordPage } from './components/Auth/ResetPasswordPage'
import { ProjectsPage } from './components/Projects/ProjectsPage'
import { StudioInterface } from './components/StudioInterface'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './components/LandingPage/LandingPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected routes */}
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          <Route path="/studio/:projectId" element={
            <ProtectedRoute>
              <StudioInterface />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App


