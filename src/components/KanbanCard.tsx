'use client'

import React from 'react'
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
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ cardId: id, fromColumnId: columnId })
    )
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm hover:shadow transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-grab active:cursor-grabbing',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
