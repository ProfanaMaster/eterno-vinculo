import { useState } from 'react'
import { motion } from 'framer-motion'
import WizardStep from './WizardStep'
import StepIndicator from './StepIndicator'

interface WizardContainerProps {
  steps: Array<{
    id: string
    title: string
    description?: string
    component: React.ComponentType<any>
  }>
}

const WizardContainer = ({ steps }: WizardContainerProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep])
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex) || stepIndex <= currentStep) {
      setCurrentStep(stepIndex)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />
      
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="mt-8"
      >
        <WizardStep
          title={steps[currentStep].title}
          description={steps[currentStep].description}
          isActive={true}
        >
          <CurrentStepComponent
            onNext={nextStep}
            onPrev={prevStep}
            canGoNext={currentStep < steps.length - 1}
            canGoPrev={currentStep > 0}
          />
        </WizardStep>
      </motion.div>
    </div>
  )
}

export default WizardContainer