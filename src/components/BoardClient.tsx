'use client'

import { useState, useTransition } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import KanbanColumn, { KanbanItem } from './KanbanColumn'
import { moveCard, addCard, deleteCard } from '@/app/actions'

interface BoardState {
  todo: KanbanItem[]
  progress: KanbanItem[]
  done: KanbanItem[]
}

interface BoardClientProps {
  initialData: BoardState
}

export default function BoardClient({ initialData }: BoardClientProps) {
  const [columns, setColumns] = useState<BoardState>(initialData)
  const [, startTransition] = useTransition()

  const handleAddCard = (content: string) => {
    const newCard: KanbanItem = {
      id: `card-${Date.now()}`,
      content: content
    }
    
    setColumns(prev => ({
      ...prev,
      todo: [...prev.todo, newCard]
    }))

    // Persist to database
    startTransition(() => addCard(content, 'todo'))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }

    const cardId = active.id as string
    const fromColumnId = active.data.current?.columnId as string
    const toColumnId = over.id as string

    setColumns((prev) => {
      let moved: KanbanItem | undefined
      const next: BoardState = { ...prev }
      
      // Find and remove the card from its current column
      const fromColumn = fromColumnId as keyof BoardState
      const idx = next[fromColumn].findIndex((i) => i.id === cardId)
      if (idx !== -1) {
        moved = next[fromColumn].splice(idx, 1)[0]
      }
      
      // Add the card to the target column
      const toColumn = toColumnId as keyof BoardState
      if (moved && fromColumn !== toColumn) {
        next[toColumn].push(moved)
      }
      
      return { ...next }
    })

    // Persist to database
    startTransition(() => moveCard(cardId, fromColumnId, toColumnId))
  }

  const handleDeleteCard = (cardId: string, columnId: string) => {
    setColumns(prev => {
      const next: BoardState = { ...prev }
      const column = columnId as keyof BoardState
      next[column] = next[column].filter(c => c.id !== cardId)
      return { ...next }
    })

    startTransition(() => deleteCard(cardId, columnId))
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <main className="container mx-auto py-8 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
        <KanbanColumn
          id="todo"
          title="Todo"
          accent="border-orange-500"
          items={columns.todo}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
        />
        <KanbanColumn
          id="progress"
          title="In Progress"
          accent="border-blue-500"
          items={columns.progress}
          onDeleteCard={handleDeleteCard}
        />
        <KanbanColumn
          id="done"
          title="Done"
          accent="border-green-500"
          items={columns.done}
          onDeleteCard={handleDeleteCard}
        />
      </main>
    </DndContext>
  )
}
