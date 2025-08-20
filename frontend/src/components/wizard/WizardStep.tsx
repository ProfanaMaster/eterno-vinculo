import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface WizardStepProps {
  children: ReactNode
  title: string
  description?: string
  isActive: boolean
}

const WizardStep = ({ children, title, description, isActive }: WizardStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${isActive ? 'block' : 'hidden'}`}
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        {description && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {children}
      </div>
    </motion.div>
  )
}

export default WizardStep