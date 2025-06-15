'use client'

import React, { useState, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ExpandableProps {
  children: React.ReactNode | ((props: { isExpanded: boolean; toggle: () => void }) => React.ReactNode)
  expanded?: boolean
  onToggle?: () => void
  className?: string
}

const ExpandableContext = createContext<{
  isExpanded: boolean
  toggle: () => void
} | null>(null)

export function Expandable({
  children,
  expanded,
  onToggle,
  className
}: ExpandableProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)

  const isControlled = expanded !== undefined
  const currentExpanded = isControlled ? expanded : internalExpanded

  const handleToggle = useCallback(() => {
    if (!isControlled) {
      setInternalExpanded(prev => !prev)
    }
    onToggle?.()
  }, [isControlled, onToggle])

  return (
    <ExpandableContext.Provider value={{ isExpanded: currentExpanded, toggle: handleToggle }}>
      <div className={className}>
        {typeof children === 'function'
          ? children({ isExpanded: currentExpanded, toggle: handleToggle })
          : children
        }
      </div>
    </ExpandableContext.Provider>
  )
}

export function useExpandable() {
  const context = useContext(ExpandableContext)
  if (!context) {
    throw new Error('useExpandable must be used within an Expandable')
  }
  return context
}

export function ExpandableTrigger({
  className,
  children,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { toggle } = useExpandable()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    toggle()
    onClick?.(e)
  }

  return (
    <div className={className} onClick={handleClick} {...props}>
      {children}
    </div>
  )
}

interface ExpandableCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function ExpandableCard({ children, className, onClick }: ExpandableCardProps) {
  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-out cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface ExpandableContentProps {
  children: React.ReactNode
  isExpanded: boolean
  className?: string
}

export function ExpandableContent({ children, isExpanded, className }: ExpandableContentProps) {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ 
            duration: 0.3,
            ease: 'easeOut'
          }}
          className={cn('overflow-hidden', className)}
        >
          <div className="pt-2">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}