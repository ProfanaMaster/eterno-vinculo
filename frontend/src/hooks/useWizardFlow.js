// hooks/useWizardFlow.js
const useWizardFlow = () => {
  const steps = [
    {
      id: 'auth',
      title: 'Registro',
      description: 'Crea tu cuenta',
      component: AuthStep,
      validation: (data) => data.email && data.password
    },
    {
      id: 'package',
      title: 'Paquete',
      description: 'Selecciona tu paquete',
      component: PackageStep,
      validation: (data) => data.selectedPackage
    },
    {
      id: 'payment',
      title: 'Pago',
      description: 'Completa tu compra',
      component: PaymentStep,
      validation: (data) => data.paymentStatus === 'completed'
    },
    {
      id: 'editor',
      title: 'Editor',
      description: 'Diseña el perfil',
      component: EditorStep,
      validation: (data) => data.profile_name && data.description
    },
    {
      id: 'preview',
      title: 'Vista Previa',
      description: 'Revisa antes de publicar',
      component: PreviewStep,
      validation: () => true
    },
    {
      id: 'publish',
      title: 'Publicación',
      description: 'Memorial listo',
      component: PublishStep,
      validation: () => true
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const nextStep = () => {
    if (steps[currentStep].validation(formData)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return {
    currentStep: steps[currentStep],
    stepIndex: currentStep,
    totalSteps: steps.length,
    nextStep,
    prevStep,
    formData,
    setFormData: (data) => setFormData(prev => ({ ...prev, ...data }))
  };
};