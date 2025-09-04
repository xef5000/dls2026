import React from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * RoleGuard component for conditional rendering based on user roles
 * 
 * @param {Object} props
 * @param {string|string[]} props.roles - Required role(s) to show content
 * @param {React.ReactNode} props.children - Content to render if user has required role
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have required role
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 */
const RoleGuard = ({ 
  roles, 
  children, 
  fallback = null, 
  requireAuth = true 
}) => {
  const { user } = useAuth()

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return fallback
  }

  // If no roles specified, just check authentication
  if (!roles) {
    return user ? children : fallback
  }

  // Normalize roles to array
  const requiredRoles = Array.isArray(roles) ? roles : [roles]

  // Get user role from user metadata or default to 'user'
  const userRole = user?.user_metadata?.role || 'user'

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.includes(userRole)

  return hasRequiredRole ? children : fallback
}

/**
 * Hook to check user permissions
 */
export const usePermissions = () => {
  const { user } = useAuth()

  const userRole = user?.user_metadata?.role || 'user'

  const hasRole = (roles) => {
    if (!user) return false
    const requiredRoles = Array.isArray(roles) ? roles : [roles]
    return requiredRoles.includes(userRole)
  }

  const canCreateArticles = () => hasRole(['editor', 'admin'])
  const canEditAllArticles = () => hasRole(['admin'])
  const canManageUsers = () => hasRole(['admin'])

  return {
    user,
    userRole,
    hasRole,
    canCreateArticles,
    canEditAllArticles,
    canManageUsers,
    isEditor: userRole === 'editor',
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user'
  }
}

export default RoleGuard
