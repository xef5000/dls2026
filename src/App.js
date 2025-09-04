import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

// Pages
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Landing from './pages/Landing'
import Profile from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes (redirect to dashboard if authenticated) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />

            {/* Routes accessible to all users */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />

            {/* Protected routes (require authentication) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to landing page */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App