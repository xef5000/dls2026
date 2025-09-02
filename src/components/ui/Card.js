import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: ''
  }

  const classes = clsx(
    'bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20',
    hover && 'hover:shadow-xl transition-all duration-300',
    paddingClasses[padding],
    className
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={classes}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
