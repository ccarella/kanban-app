'use client'

import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { MoreVertical } from 'lucide-react'

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  columnId: string
  onDelete?: (cardId: string) => void
}

export default function KanbanCard({
  id,
  columnId,
  className,
  children,
  onDelete,
  ...props
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      columnId: columnId,
    },
  })

  const [open, setOpen] = useState(false)

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen((prev) => !prev)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
    onDelete?.(id)
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'relative bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm hover:shadow transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-grab',
        isDragging ? 'ring-2 ring-blue-500' : '',
        className
      )}
      {...props}
    >
      <button
        onClick={toggleMenu}
        className="absolute top-1 right-1 p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-1 top-7 z-10 bg-white border border-neutral-300 rounded-md shadow-md">
          <button
            onClick={handleDelete}
            className="block px-3 py-1 text-sm hover:bg-neutral-100 w-full text-left"
          >
            Delete
          </button>
        </div>
      )}
      {children}
    </div>
  )
}
