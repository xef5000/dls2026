import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Star, Zap } from 'lucide-react'
import Layout from '../components/layout/Layout'

const Landing = () => {
  return (
    <Layout>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
        {/* Animated background shapes */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-10 w-48 h-48 bg-primary-200 rounded-full opacity-50 blur-xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 right-10 w-64 h-64 bg-secondary-200 rounded-full opacity-50 blur-xl"
        />

        <div className="relative z-10 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Welcome to Your Final Year
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Track your progress, stay motivated, and countdown the days to graduation. Your journey to the finish line starts here.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: 'backOut' }}
          >
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out"
            >
              <LogIn className="w-6 h-6 mr-3" />
              Get Started
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-md">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Live Progress Tracking</h3>
                <p className="text-gray-600">
                  Visualize your high school career completion and semester progress in real-time.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-md">
                <Star className="w-6 h-6 text-secondary-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Stay Motivated</h3>
                <p className="text-gray-600">
                  See how many days are left until graduation and stay focused on your goals.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-md">
                <LogIn className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Easy Access</h3>
                <p className="text-gray-600">
                  Quickly log in to see your personalized dashboard and detailed statistics.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default Landing
