'use client'

import React from 'react'
import KanbanCard from './KanbanCard'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

export interface KanbanItem {
  id: string
  content: string
}

interface KanbanColumnProps {
  id: string
  title: string
  items: KanbanItem[]
  onDrop: (cardId: string, fromColumnId: string) => void
}

export default function KanbanColumn({ id, title, items, onDrop }: KanbanColumnProps) {
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
    <Card className="bg-muted/50">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent
        className="flex flex-col gap-2 p-4 min-h-24"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {items.map((item) => (
          <KanbanCard key={item.id} id={item.id} columnId={id}>
            {item.content}
          </KanbanCard>
        ))}
      </CardContent>
    </Card>
  )
}
