'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui'

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  columnId: string
  onDelete?: (id: string, columnId: string) => void
}

export default function KanbanCard({
  id,
  columnId,
  onDelete,
  className,
  children,
  ...props
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      columnId: columnId,
    },
  })

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute top-1 right-1 rounded p-1 hover:bg-neutral-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => onDelete?.(id, columnId)}
            className="cursor-pointer"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {children}
    </div>
  )
}
