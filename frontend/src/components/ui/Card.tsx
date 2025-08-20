import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

/**
 * Componente Card reutilizable
 * Base para tarjetas con diferentes variantes
 */
function Card({ children, className = '', hover = true, padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const classes = [
    'card',
    paddingClasses[padding],
    hover ? 'hover:shadow-lg hover:-translate-y-1' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {children}
    </div>
  )
}

export default Card