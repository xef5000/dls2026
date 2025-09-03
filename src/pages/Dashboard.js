import React, { useEffect, useState } from 'react'
//import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, GraduationCap, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'

// const QuickActionCard = ({ title, description, icon: Icon, to, color = 'primary', delay = 0 }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.5, delay }}
//   >
//     <Link
//       to={to}
//       className="block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 group"
//     >
//       <div className="flex items-center space-x-4">
//         <div className={`p-3 rounded-lg bg-gradient-to-r ${
//           color === 'primary' ? 'from-primary-500 to-primary-600' :
//           color === 'secondary' ? 'from-secondary-500 to-secondary-600' :
//           color === 'success' ? 'from-green-500 to-green-600' :
//           'from-purple-500 to-purple-600'
//         } group-hover:scale-110 transition-transform duration-200`}>
//           <Icon className="h-6 w-6 text-white" />
//         </div>
//         <div className="flex-1">
//           <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
//             {title}
//           </h3>
//           <p className="text-sm text-gray-600">{description}</p>
//         </div>
//       </div>
//     </Link>
//   </motion.div>
// )

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    careerPercentage: 0,
    semesterPercentage: 0,
    daysLeft: 0,
    currentSemesterName: '',
  })

  useEffect(() => {
    // --- CONFIGURATION ---
    const schoolYear = {
      startDate: new Date('2025-08-26T00:00:00'),
      endDate: new Date('2026-06-19T23:59:59'),
      holidays: [
        { start: new Date('2025-12-22T00:00:00'), end: new Date('2026-01-02T23:59:59') },
        { start: new Date('2026-03-16T00:00:00'), end: new Date('2026-03-20T23:59:59') }
      ],
      paDays: [
        new Date('2025-10-10T00:00:00'), new Date('2025-11-28T00:00:00'),
        new Date('2026-01-30T00:00:00'), new Date('2026-04-24T00:00:00'),
        new Date('2026-06-05T00:00:00')
      ],
      statutoryHolidays: [
        new Date('2025-09-01T00:00:00'), new Date('2025-10-13T00:00:00'),
        new Date('2026-02-16T00:00:00'), new Date('2026-04-03T00:00:00'),
        new Date('2026-04-06T00:00:00'), new Date('2026-05-18T00:00:00')
      ]
    }

    const semester1 = {
      name: 'Semester 1',
      startDate: new Date('2025-08-26T00:00:00'),
      endDate: new Date('2026-01-23T23:59:59')
    }

    const semester2 = {
      name: 'Semester 2',
      startDate: new Date('2026-01-26T00:00:00'),
      endDate: new Date('2026-06-19T23:59:59')
    }

    const GRADES = 13 // K-12

    // --- UTILITY FUNCTIONS ---
    const isSchoolDay = (date, yearInfo) => {
      const day = date.getDay()
      if (day === 0 || day === 6) return false

      const dateString = date.toISOString().split('T')[0]
      if (yearInfo.paDays.some(d => d.toISOString().split('T')[0] === dateString)) return false
      if (yearInfo.statutoryHolidays.some(d => d.toISOString().split('T')[0] === dateString)) return false

      for (const holiday of yearInfo.holidays) {
        if (date >= holiday.start && date <= holiday.end) return false
      }

      return true
    }

    const getSchoolDays = (start, end, yearInfo) => {
      let count = 0
      let currentDate = new Date(start)
      while (currentDate <= end) {
        if (isSchoolDay(currentDate, yearInfo)) {
          count++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return count
    }

    // --- CALCULATIONS ---
    const calculateStats = () => {
      const now = new Date()

      const totalSchoolDaysInYear = getSchoolDays(schoolYear.startDate, schoolYear.endDate, schoolYear)
      const totalSchoolDaysK12 = totalSchoolDaysInYear * GRADES
      const schoolDaysCompletedK11 = totalSchoolDaysInYear * 12
      const schoolDaysCompletedThisYear = getSchoolDays(schoolYear.startDate, now, schoolYear)
      const totalSchoolDaysCompleted = schoolDaysCompletedK11 + schoolDaysCompletedThisYear
      const careerPercentage = (totalSchoolDaysCompleted / totalSchoolDaysK12) * 100
      const daysLeft = totalSchoolDaysInYear - schoolDaysCompletedThisYear

      let currentSemester
      if (now >= semester1.startDate && now <= semester1.endDate) {
        currentSemester = semester1
      } else if (now >= semester2.startDate && now <= semester2.endDate) {
        currentSemester = semester2
      } else {
        currentSemester = now < semester1.startDate ? semester1 : semester2
      }

      const totalSemesterDays = getSchoolDays(currentSemester.startDate, currentSemester.endDate, schoolYear)
      const semesterDaysCompleted = getSchoolDays(currentSemester.startDate, now, schoolYear)
      let semesterPercentage = 0
      if (totalSemesterDays > 0) {
        semesterPercentage = (semesterDaysCompleted / totalSemesterDays) * 100
      }

      setStats({
        careerPercentage: Math.min(careerPercentage.toFixed(2), 100),
        semesterPercentage: Math.min(semesterPercentage.toFixed(2), 100),
        daysLeft: Math.max(daysLeft, 0),
        currentSemesterName: currentSemester.name,
      })
    }

    calculateStats()
    const interval = setInterval(calculateStats, 60000)

    return () => clearInterval(interval)
  }, [])

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="School Career Progress"
            progress={parseFloat(stats.careerPercentage)}
            subtitle="Complete K-12 education journey"
            icon={GraduationCap}
            color="primary"
            delay={0.1}
          />
          
          <Card
            title={`${stats.currentSemesterName} Progress`}
            progress={parseFloat(stats.semesterPercentage)}
            subtitle="Current semester completion"
            icon={TrendingUp}
            color="secondary"
            delay={0.2}
          />
          
          <Card
            title="Days of School Left"
            value={stats.daysLeft}
            subtitle="Until graduation day"
            icon={Calendar}
            color="success"
            delay={0.3}
          />
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Progress Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Academic Year 2025-2026</h3>
              <p className="text-gray-600 text-sm">
                You're currently in your final year of high school. Every day counts towards your graduation goal!
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Current Status</h3>
              <p className="text-gray-600 text-sm">
                {stats.daysLeft > 0 
                  ? `${stats.daysLeft} school days remaining until you complete your K-12 journey.`
                  : 'Congratulations! You have completed your K-12 education!'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default Dashboard
