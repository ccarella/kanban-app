'use client'

import React from 'react'
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
  onDrop: (cardId: string, fromColumnId: string) => void
}

export default function KanbanColumn({ id, title, accent, items, onDrop }: KanbanColumnProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('text/plain')
    if (!data) return
    try {
      const { cardId, fromColumnId } = JSON.parse(data) as {
        cardId: string
        fromColumnId: string
      }
      onDrop(cardId, fromColumnId)
    } catch {
      // ignore invalid data
    }
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <section className="flex flex-col bg-white/60 backdrop-blur-md border border-neutral-300 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <header className={`px-4 py-3 text-xs font-semibold tracking-wider uppercase border-l-4 ${accent}`}>{title}</header>
      <div
        className="flex flex-col gap-3 p-4 grow"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
