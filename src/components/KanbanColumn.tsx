'use client'

import React, { useState, KeyboardEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import KanbanCard from './KanbanCard'

export interface KanbanItem {
  id: string
  content: string
  description?: string
}

interface KanbanColumnProps {
  id: string
  title: string
  accent: string
  items: KanbanItem[]
  onAddCard?: (content: string) => void
  onCardClick?: (card: KanbanItem) => void
}

export default function KanbanColumn({ id, title, accent, items, onAddCard, onCardClick }: KanbanColumnProps) {
  const [inputValue, setInputValue] = useState('')
  const { setNodeRef } = useDroppable({
    id: id,
  })

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && onAddCard) {
        onAddCard(inputValue.trim())
        setInputValue('')
        // Reset textarea height
        e.currentTarget.style.height = 'auto'
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <section className="flex flex-col bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <header className={`px-4 py-3 text-xs font-semibold tracking-wider uppercase border-l-4 ${accent}`}>{title}</header>
      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 p-4 grow"
      >
        {onAddCard && (
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type and press Enter to add a card..."
            className="w-full px-3 py-2 text-sm bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground min-h-[36px]"
            rows={1}
          />
        )}
        {items.map((item) => (
          <KanbanCard 
            key={item.id} 
            id={item.id} 
            columnId={id}
            description={item.description}
            title={item.content}
            onClick={() => onCardClick?.(item)}
          >
            {item.content}
          </KanbanCard>
        ))}
      </div>
    </section>
  )
}
