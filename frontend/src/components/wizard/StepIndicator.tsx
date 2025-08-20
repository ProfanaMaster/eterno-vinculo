import { motion } from 'framer-motion'

interface Step {
  id: string
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
  onStepClick: (stepIndex: number) => void
}

const StepIndicator = ({ steps, currentStep, completedSteps, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.button
            onClick={() => onStepClick(index)}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              transition-colors duration-200
              ${completedSteps.includes(index) 
                ? 'bg-green-500 text-white' 
                : index === currentStep 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }
              ${(completedSteps.includes(index) || index <= currentStep) 
                ? 'cursor-pointer hover:opacity-80' 
                : 'cursor-not-allowed'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!completedSteps.includes(index) && index > currentStep}
          >
            {completedSteps.includes(index) ? '✓' : index + 1}
          </motion.button>
          
          <div className="ml-3 hidden sm:block">
            <p className={`text-sm font-medium ${
              index === currentStep ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step.title}
            </p>
          </div>
          
          {index < steps.length - 1 && (
            <div className={`
              w-12 h-0.5 mx-4
              ${completedSteps.includes(index) ? 'bg-green-500' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  )
}

export default StepIndicator