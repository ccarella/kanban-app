'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { MoreVertical } from 'lucide-react'

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  columnId: string
  onDelete?: (cardId: string, columnId: string) => void
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
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.parentElement?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

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
        ref={btnRef}
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((p) => !p)
        }}
        className="absolute top-1 right-1 p-1 rounded hover:bg-neutral-100"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute top-7 right-1 z-10 bg-white border border-neutral-200 rounded-md shadow-md">
          <button
            className="block w-full text-left px-3 py-1 text-sm hover:bg-neutral-100"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(id, columnId)
              setOpen(false)
            }}
          >
            Delete
          </button>
        </div>
      )}
      {children}
    </div>
  )
}
