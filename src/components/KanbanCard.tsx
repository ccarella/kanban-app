'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  columnId: string
}

export default function KanbanCard({
  id,
  columnId,
  className,
  children,
  ...props
}: KanbanCardProps) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id,
    data: { columnId },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm hover:shadow transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-grab',
        isDragging && 'ring-2 ring-secondary',
        className
      )}
      {...listeners}
      {...attributes}
      {...props}
    >
      {children}
    </div>
  )
}
