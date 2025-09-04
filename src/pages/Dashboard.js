import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, User, Settings, BarChart3, Calendar, Clock, FileText, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../components/RoleGuard'
import Layout from '../components/layout/Layout'
import SchoolProgress from '../components/SchoolProgress'

const QuickActionCard = ({ title, description, icon: Icon, to, color = 'primary', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Link
      to={to}
      className="block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${
          color === 'primary' ? 'from-primary-500 to-primary-600' :
          color === 'secondary' ? 'from-secondary-500 to-secondary-600' :
          color === 'success' ? 'from-green-500 to-green-600' :
          'from-purple-500 to-purple-600'
        } group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  </motion.div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const { canCreateArticles, userRole } = usePermissions()
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Student'

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Your personalized dashboard for Grade 12
          </p>
          {userRole !== 'user' && (
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                userRole === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {userRole === 'admin' ? '👑 Administrator' : '✍️ Editor'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-gray-900"
          >
            Quick Actions
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionCard
              title="Live Chat"
              description="Connect with other students in real-time"
              icon={MessageCircle}
              to="/chat"
              color="primary"
              delay={0.1}
            />

            <QuickActionCard
              title="View Articles"
              description="Read the latest articles and insights"
              icon={FileText}
              to="/articles"
              color="secondary"
              delay={0.2}
            />

            {canCreateArticles && (
              <QuickActionCard
                title="Write Article"
                description="Share your knowledge with the community"
                icon={Plus}
                to="/articles/new"
                color="success"
                delay={0.3}
              />
            )}

            <QuickActionCard
              title="Profile Settings"
              description="Update your account information"
              icon={User}
              to="/profile"
              color="purple"
              delay={canCreateArticles ? 0.4 : 0.3}
            />
          </div>
        </div>

        {/* Compact School Progress */}
        <div className="space-y-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-2xl font-bold text-gray-900"
          >
            Your Progress Summary
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <SchoolProgress showTitle={false} compact={true} />
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Account created</p>
                <p className="text-xs text-gray-500">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>

            {canCreateArticles && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Article creation enabled</p>
                  <p className="text-xs text-gray-500">
                    You can create and publish articles
                  </p>
                </div>
              </div>
            )}

            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">More activity will appear here as you use the app</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default Dashboard
