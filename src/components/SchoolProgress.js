import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, TrendingUp, GraduationCap } from 'lucide-react'

// Reusable ProgressBar Component
const ProgressBar = ({ percentage, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    success: 'from-green-500 to-green-600',
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
      />
    </div>
  )
}

const StatCard = ({ title, value, subtitle, icon: Icon, progress, color = 'primary', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-r ${
        color === 'primary' ? 'from-primary-500 to-primary-600' :
        color === 'secondary' ? 'from-secondary-500 to-secondary-600' :
        'from-green-500 to-green-600'
      }`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {progress !== undefined && (
        <span className={`text-2xl font-bold ${
          color === 'primary' ? 'text-primary-600' :
          color === 'secondary' ? 'text-secondary-600' :
          'text-green-600'
        }`}>
          {progress}%
        </span>
      )}
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    
    {progress !== undefined ? (
      <div className="space-y-2">
        <ProgressBar percentage={progress} color={color} />
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    ) : (
      <>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </>
    )}
  </motion.div>
)

const SchoolProgress = ({ showTitle = true, compact = false }) => {
  const [stats, setStats] = useState({
    careerPercentage: 0,
    semesterPercentage: 0,
    daysLeft: 0,
    currentSemesterName: 'Semester',
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

    const GRADES = 13

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

  return (
    <div className="space-y-8">
      {showTitle && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Grade 12 Progress - Ottawa, ON
          </h2>
          <p className="text-lg text-gray-600">
            Academic Year 2025-2026
          </p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
        <StatCard
          title="School Career Progress"
          progress={parseFloat(stats.careerPercentage)}
          subtitle="Complete K-12 education journey"
          icon={GraduationCap}
          color="primary"
          delay={0.1}
        />
        
        <StatCard
          title={`${stats.currentSemesterName} Progress`}
          progress={parseFloat(stats.semesterPercentage)}
          subtitle="Current semester completion"
          icon={TrendingUp}
          color="secondary"
          delay={0.2}
        />
        
        <StatCard
          title="Days of School Left"
          value={stats.daysLeft}
          subtitle="Until graduation day"
          icon={Calendar}
          color="success"
          delay={0.3}
        />
      </div>

      {!compact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">Progress Overview</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Academic Year 2025-2026</h4>
              <p className="text-gray-600 text-sm">
                Track your final year of high school. Every day counts towards your graduation goal!
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
              <p className="text-gray-600 text-sm">
                {stats.daysLeft > 0 
                  ? `${stats.daysLeft} school days remaining until you complete your K-12 journey.`
                  : 'Congratulations! You have completed your K-12 education!'
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SchoolProgress
