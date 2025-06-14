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
  onClick,
  ...props
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      columnId: columnId,
    },
  })

  const handleClick = (e: React.MouseEvent) => {
    // Only fire onClick if we're not dragging
    if (!isDragging && onClick) {
      onClick(e)
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={cn(
        'bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm hover:shadow transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-grab',
        isDragging ? 'ring-2 ring-blue-500' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
