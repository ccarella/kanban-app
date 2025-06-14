'use client'

import React from 'react'
import KanbanCard from './KanbanCard'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

export interface KanbanItem {
  id: string
  content: string
}

interface KanbanColumnProps {
  title: string
  items: KanbanItem[]
  onDrop: (id: string) => void
}

export default function KanbanColumn({ title, items, onDrop }: KanbanColumnProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) onDrop(id)
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
          <KanbanCard key={item.id} id={item.id}>
            {item.content}
          </KanbanCard>
        ))}
      </CardContent>
    </Card>
  )
}
