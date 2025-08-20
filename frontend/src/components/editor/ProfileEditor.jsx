// components/editor/ProfileEditor.jsx
const ProfileEditor = ({ profileData, onSave, onPreview }) => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { id: 'basic', component: BasicInfoStep },
    { id: 'images', component: ImageUploadStep },
    { id: 'gallery', component: GalleryStep },
    { id: 'video', component: VideoUploadStep },
    { id: 'template', component: TemplateSelectionStep }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator steps={steps} activeStep={activeStep} />
      <StepContent 
        step={steps[activeStep]} 
        data={profileData}
        onNext={() => setActiveStep(prev => prev + 1)}
        onPrev={() => setActiveStep(prev => prev - 1)}
      />
    </div>
  );
};