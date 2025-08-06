import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContextProvider'
import { LoginPage } from './components/Auth/LoginPage'
import { SignupPage } from './components/Auth/SignupPage'
import { ResetPasswordPage } from './components/Auth/ResetPasswordPage'
import { ProjectsPage } from './components/Projects/ProjectsPage'
import { StudioInterface } from './components/StudioInterface'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
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
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/projects" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App


