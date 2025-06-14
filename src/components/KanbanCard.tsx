'use client'

import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { MoreHorizontal } from 'lucide-react'

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  columnId: string
  onDelete?: () => void
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

  const [menuOpen, setMenuOpen] = useState(false)

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
      {children}
      <button
        className="absolute top-1 right-1 p-1 text-neutral-500 hover:text-neutral-700"
        onClick={(e) => {
          e.stopPropagation()
          setMenuOpen((p) => !p)
        }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {menuOpen && (
        <div className="absolute z-10 top-7 right-1 bg-white border border-neutral-300 rounded-md shadow-md">
          <button
            className="px-3 py-1 text-sm text-left text-red-600 hover:bg-red-50 w-full"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(false)
              onDelete?.()
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
