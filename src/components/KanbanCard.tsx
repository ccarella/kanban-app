'use client'

import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Expandable, ExpandableCard, ExpandableContent } from './ui/expandable'
import { Copy } from 'lucide-react'

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  columnId: string
  description?: string
  title?: string
}

export default function KanbanCard({
  id,
  columnId,
  className,
  children,
  onClick,
  description,
  title,
  ...props
}: KanbanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      columnId: columnId,
    },
  })

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent click during drag
    if (!isDragging) {
      e.stopPropagation()
      setIsExpanded(!isExpanded)
      onClick?.(e)
    }
  }

  const getTextFromChildren = (children: React.ReactNode): string => {
    if (typeof children === 'string') return children
    if (typeof children === 'number') return String(children)
    if (!children) return ''
    
    const childArray = React.Children.toArray(children)
    return childArray.map(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }
      if (React.isValidElement(child)) {
        const element = child as React.ReactElement<{ children?: React.ReactNode }>
        if (element.props && element.props.children) {
          return getTextFromChildren(element.props.children)
        }
      }
      return ''
    }).join('')
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const cardTitle = title || getTextFromChildren(children)
    const textToCopy = `Feature: ${cardTitle} - ${description || ''}`
    try {
      await navigator.clipboard.writeText(textToCopy)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <Expandable expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <ExpandableCard
        className={cn(
          'bg-card border border-border rounded-xl px-4 py-3 text-sm hover:shadow transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0',
          isDragging ? 'ring-2 ring-ring cursor-grabbing' : 'cursor-pointer',
          isExpanded ? 'shadow-md' : '',
          className
        )}
      >
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          onClick={handleClick}
          {...props}
        >
          <div className="select-none">{children}</div>
          
          <ExpandableContent isExpanded={isExpanded}>
            {description && (
              <div className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
                <p className="font-medium text-xs text-muted-foreground mb-1">Details:</p>
                <p className="whitespace-pre-wrap">{description}</p>
                <button
                  onClick={handleCopy}
                  className="mt-2 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors inline-flex items-center gap-2 text-xs"
                  aria-label="Copy card details"
                >
                  <Copy size={14} />
                  <span>Copy</span>
                </button>
              </div>
            )}
          </ExpandableContent>
        </div>
      </ExpandableCard>
    </Expandable>
  )
}