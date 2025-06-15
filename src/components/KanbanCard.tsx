'use client'

import React, { useState, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Expandable, ExpandableCard, ExpandableContent } from './ui/expandable'
import { Input } from './ui/input'

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  columnId: string
  description?: string
  onUpdateDescription?: (cardId: string, description: string) => void
}

export default function KanbanCard({
  id,
  columnId,
  className,
  children,
  description,
  onUpdateDescription,
  onClick,
  ...props
}: KanbanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [descInput, setDescInput] = useState('')
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      columnId: columnId,
    },
  })

  useEffect(() => {
    if (description) {
      setDescInput('')
    }
  }, [description])

  const handleSave = () => {
    const trimmed = descInput.trim()
    if (trimmed) {
      onUpdateDescription?.(id, trimmed)
      setDescInput('')
    }
    setIsExpanded(false)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent click during drag
    if (!isDragging) {
      e.stopPropagation()
      setIsExpanded(!isExpanded)
      if (description) {
        onClick?.(e)
      }
    }
  }

  return (
    <Expandable expanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)}>
      <ExpandableCard
        className={cn(
          'bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm hover:shadow transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0',
          isDragging ? 'ring-2 ring-blue-500 cursor-grabbing' : 'cursor-pointer',
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
            {description ? (
              <div className="text-sm text-neutral-600 border-t border-neutral-200 pt-2 mt-2">
                <p className="font-medium text-xs text-neutral-500 mb-1">Details:</p>
                <p className="whitespace-pre-wrap">{description}</p>
              </div>
            ) : (
              <Input
                autoFocus
                placeholder="Add a description..."
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSave()
                  }
                }}
                onBlur={handleSave}
                className="mt-2 text-sm"
              />
            )}
          </ExpandableContent>
        </div>
      </ExpandableCard>
    </Expandable>
  )
}