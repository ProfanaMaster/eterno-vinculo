// components/wizard/MobileOptimizedWizard.jsx
const MobileOptimizedWizard = () => {
  const { isMobile } = useMediaQuery();
  
  return (
    <div className={`
      ${isMobile ? 'min-h-screen flex flex-col' : 'container mx-auto py-8'}
    `}>
      {isMobile ? (
        <MobileWizardLayout />
      ) : (
        <DesktopWizardLayout />
      )}
    </div>
  );
};