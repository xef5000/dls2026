import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/layout/Layout'

function Dashboard() {
  const { user } = useAuth()

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
            Track your journey through Grade 12 - Ottawa, ON
          </p>
        </motion.div>

      </div>
    </Layout>
  )
}

export default Dashboard
