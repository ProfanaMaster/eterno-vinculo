import { useEffect, useState } from 'react'

interface FlowerAnimationProps {
  accentColor: string
}

export default function FlowerAnimation({ }: FlowerAnimationProps) {
  const [showFlowers, setShowFlowers] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowFlowers(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️']

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Flores alrededor de la foto */}
      {flowers.map((flower, index) => {
        const angle = (index * 60) - 30 // Distribuir en círculo
        const radius = 80 // Distancia de la foto
        const x = Math.cos(angle * Math.PI / 180) * radius
        const y = Math.sin(angle * Math.PI / 180) * radius
        
        return (
          <div
            key={index}
            className={`absolute text-2xl transition-all duration-1000 ${
              showFlowers 
                ? 'opacity-100 scale-100 animate-bounce' 
                : 'opacity-0 scale-0'
            }`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${index * 200}ms`,
              animationDuration: '2s'
            }}
          >
            {flower}
          </div>
        )
      })}
      
      {/* Pétalos cayendo */}
      {showFlowers && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={`petal-${i}`}
              className="absolute text-pink-300 opacity-60 animate-pulse"
              style={{
                left: `${20 + i * 10}%`,
                top: '10%',
                animationDelay: `${i * 300}ms`,
                animationDuration: '3s'
              }}
            >
              🌸
            </div>
          ))}
        </>
      )}
    </div>
  )
}