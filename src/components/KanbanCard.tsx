'use client'

import React from 'react'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
}

export default function KanbanCard({ id, className, children, ...props }: KanbanCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', id)
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className={cn('bg-background p-3 rounded-md shadow-sm cursor-grab active:cursor-grabbing', className)}
      {...props}
    >
      {children}
    </Card>
  )
}
