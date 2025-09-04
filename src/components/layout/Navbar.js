import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  GraduationCap,
  MessageCircle,
  FileText
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
    setIsUserMenuOpen(false)
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <GraduationCap className="h-8 w-8" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                DLS 2026
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/articles"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Articles</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/chat"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </Link>
              </>
            )}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{user.email}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/articles"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FileText className="h-4 w-4" />
                  <span>Articles</span>
                </Link>

                {user && (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/chat"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </Link>
                  </>
                )}

                {user ? (
                  <>
                    <div className="flex items-center space-x-2 text-gray-700 pl-8">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors pl-8"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors pl-8"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors pl-8"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="btn-primary inline-block text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
