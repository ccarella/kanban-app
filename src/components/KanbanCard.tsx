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
            <div className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
              <p className="font-medium text-xs text-muted-foreground mb-1">Details:</p>
              <p className="whitespace-pre-wrap">Create a new branch for this feature. Implement it, create Tests when relevant, run no test and fix any broken tests, give me a summary of what was done, update Claude.md with anything relevant for future development (but be picky and brief), make a PR, monitor the PR&apos;s tests, if they fail fix them and try again, if they succeed let me know the branch is safe to be merged.</p>
            </div>
          </ExpandableContent>
        </div>
      </ExpandableCard>
    </Expandable>
  )
}