'use client'

import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Expandable, ExpandableCard, ExpandableContent } from './ui/expandable'

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  columnId: string
  description?: string
}

export default function KanbanCard({
  id,
  columnId,
  className,
  children,
  description,
  onClick,
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
            {description && (
              <div className="text-sm text-neutral-600 border-t border-neutral-200 pt-2 mt-2">
                <p className="font-medium text-xs text-neutral-500 mb-1">Details:</p>
                <p className="whitespace-pre-wrap">{description}</p>
              </div>
            )}
          </ExpandableContent>
        </div>
      </ExpandableCard>
    </Expandable>
  )
}