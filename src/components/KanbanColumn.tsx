'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import KanbanCard from './KanbanCard'

export interface KanbanItem {
  id: string
  content: string
}

interface KanbanColumnProps {
  id: string
  title: string
  accent: string
  items: KanbanItem[]
}

export default function KanbanColumn({ id, title, accent, items }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <section className="flex flex-col bg-white/60 backdrop-blur-md border border-neutral-300 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <header className={`px-4 py-3 text-xs font-semibold tracking-wider uppercase border-l-4 ${accent}`}>{title}</header>
      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 p-4 grow"
      >
        {items.map((item) => (
          <KanbanCard key={item.id} id={item.id} columnId={id}>
            {item.content}
          </KanbanCard>
        ))}
      </div>
    </section>
  )
}
