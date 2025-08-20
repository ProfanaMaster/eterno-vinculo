// Opciones de ajuste de fondo para diferentes tipos de imagen

export const getBackgroundStyle = (backgroundImage, fitType = 'contain') => {
  if (!backgroundImage) return {}

  const styles = {
    // Para imágenes que deben mostrarse completas sin recorte
    contain: {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    },
    
    // Para imágenes que deben cubrir toda la pantalla (puede recortar)
    cover: {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    },
    
    // Para patrones que se repiten
    pattern: {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'auto',
      backgroundPosition: 'top left',
      backgroundRepeat: 'repeat'
    },
    
    // Para imágenes centradas con tamaño fijo
    center: {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: '80% auto',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }

  return styles[fitType] || styles.contain
}