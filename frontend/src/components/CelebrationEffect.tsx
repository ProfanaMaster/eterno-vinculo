import React, { useState, useEffect, useMemo } from 'react';

interface ConfettiPiece {
  id: number;
  startX: number;
  startY: number;
  color: string;
  size: number;
  animationDelay: number;
  animationDuration: number;
}

interface Balloon {
  id: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
  emoji: string;
  size: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  animationDelay: number;
  color: string;
}

interface CelebrationEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ isActive, onComplete }) => {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  // Memoizar colores para evitar recreación en cada render
  const colors = useMemo(() => [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
    '#f0932b', '#eb4d4b', '#ff9ff3', '#54a0ff'
  ], []);

  const balloonEmojis = useMemo(() => ['🎈', '🎉', '🎊', '✨', '🌟', '💫'], []);

  useEffect(() => {
    if (!isActive) return;

    // CONFETI - optimizado para móvil y desktop
    const newConfetti = Array.from({ length: 80 }, (_, i) => {
      const fromLeft = Math.random() > 0.5;
      const isMobile = window.innerWidth < 768;
      
      return {
        id: i,
        startX: fromLeft ? 0 : 100,
        startY: Math.random() * (isMobile ? 15 : 20),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * (isMobile ? 4 : 6) + (isMobile ? 2 : 3),
        animationDelay: Math.random() * 2,
        animationDuration: (isMobile ? 2.5 : 3) + Math.random() * 2
      };
    });

    // GLOBOS - adaptados para móvil
    const newBalloons = Array.from({ length: window.innerWidth < 768 ? 12 : 20 }, (_, i) => {
      const isMobile = window.innerWidth < 768;
      return {
        id: i,
        left: (i * (isMobile ? 8 : 5)) % 100,
        animationDelay: Math.random() * 3,
        animationDuration: (isMobile ? 4 : 5) + Math.random() * 3,
        emoji: balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)],
        size: (isMobile ? 16 : 20) + Math.random() * (isMobile ? 12 : 15)
      };
    });

    // FUEGOS ARTIFICIALES - adaptados para móvil
    const newFireworks = Array.from({ length: window.innerWidth < 768 ? 4 : 6 }, (_, i) => {
      const isMobile = window.innerWidth < 768;
      return {
        id: i,
        x: isMobile ? 25 + (i * 16) : 20 + (i * 12),
        y: isMobile ? 15 + Math.random() * 30 : 20 + Math.random() * 40,
        animationDelay: i * 0.5,
        color: colors[i % colors.length],
      };
    });

    setConfettiPieces(newConfetti);
    setBalloons(newBalloons);
    setFireworks(newFireworks);

    const timer = setTimeout(() => {
      setConfettiPieces([]);
      setBalloons([]);
      setFireworks([]);
      onComplete?.();
    }, 7000);

    return () => clearTimeout(timer);
  }, [isActive, onComplete, colors, balloonEmojis]);

  if (!isActive) return null;

  return (
    <div className="celebration-container celebration-effect">
      {/* CONFETI */}
      {confettiPieces.map((piece) => (
        <div
          key={`confetti-${piece.id}`}
          style={{
            position: 'fixed',
            left: `${piece.startX}%`,
            top: `${piece.startY}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 1000,
            maxWidth: '100vw',
            maxHeight: '100vh',
            animation: `confetti-arc-${piece.startX < 50 ? 'left' : 'right'} ${piece.animationDuration}s ease-out ${piece.animationDelay}s forwards`
          }}
        />
      ))}

      {/* GLOBOS */}
      {balloons.map((balloon) => (
        <div
          key={`balloon-${balloon.id}`}
          style={{
            position: 'fixed',
            left: `${balloon.left}%`,
            bottom: '-50px',
            fontSize: `${balloon.size}px`,
            pointerEvents: 'none',
            zIndex: 1000,
            maxWidth: '100vw',
            maxHeight: '100vh',
            animation: `balloon-float ${balloon.animationDuration}s ease-out ${balloon.animationDelay}s forwards`
          }}
        >
          {balloon.emoji}
        </div>
      ))}

      {/* FUEGOS ARTIFICIALES */}
      {fireworks.map((firework) => (
        <div
          key={`firework-${firework.id}`}
          style={{
            position: 'fixed',
            left: `${firework.x}%`,
            top: `${firework.y}%`,
            pointerEvents: 'none',
            zIndex: 1000,
            maxWidth: '100vw',
            maxHeight: '100vh',
            animation: `firework-burst 1.5s ease-out ${firework.animationDelay}s forwards`
          }}
        >
          {/* Estrella central */}
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: firework.color,
              borderRadius: '50%',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 20px ${firework.color}`
            }}
          />
          
          {/* Partículas radiantes */}
          {Array.from({ length: 8 }, (_, j) => (
            <div
              key={j}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                backgroundColor: firework.color,
                borderRadius: '50%',
                transform: `translate(-50%, -50%) rotate(${j * 45}deg) translateX(0px)`,
                animation: `firework-particle 1.5s ease-out ${firework.animationDelay}s forwards`,
                '--angle': `${j * 45}deg`
              } as React.CSSProperties}
            />
          ))}
        </div>
      ))}

      <style>{`
        /* Prevenir scroll horizontal en móviles */
        body {
          overflow-x: hidden;
          position: relative;
          width: 100%;
        }
        
        /* Contenedor principal */
        html {
          overflow-x: hidden;
        }

        @keyframes confetti-arc-left {
          0% {
            transform: translateX(0) translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateX(40vw) translateY(20vh) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translateX(60vw) translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes confetti-arc-right {
          0% {
            transform: translateX(0) translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateX(-40vw) translateY(20vh) rotate(-180deg);
            opacity: 1;
          }
          100% {
            transform: translateX(-60vw) translateY(100vh) rotate(-360deg);
            opacity: 0;
          }
        }

        @keyframes balloon-float {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(0px) rotate(10deg);
            opacity: 0;
          }
        }

        @keyframes firework-burst {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          20% {
            transform: scale(1.5);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        @keyframes firework-particle {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0px);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(50px);
            opacity: 0;
          }
        }

        /* Media queries para móvil */
        @media (max-width: 768px) {
          /* Prevenir scroll horizontal */
          body, html {
            overflow-x: hidden;
            max-width: 100vw;
          }
          
          @keyframes confetti-arc-left {
            0% {
              transform: translateX(0) translateY(0) rotate(0deg);
              opacity: 1;
            }
            50% {
              transform: translateX(25vw) translateY(15vh) rotate(180deg);
              opacity: 1;
            }
            100% {
              transform: translateX(35vw) translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }

          @keyframes confetti-arc-right {
            0% {
              transform: translateX(0) translateY(0) rotate(0deg);
              opacity: 1;
            }
            50% {
              transform: translateX(-25vw) translateY(15vh) rotate(-180deg);
              opacity: 1;
            }
            100% {
              transform: translateX(-35vw) translateY(100vh) rotate(-360deg);
              opacity: 0;
            }
          }

          @keyframes balloon-float {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            100% {
              transform: translateY(-80vh) translateX(0px) rotate(10deg);
              opacity: 0;
            }
          }
        }
      `}</style>
    </div>
  );
};