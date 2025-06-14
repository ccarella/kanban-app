'use client'

import { useState } from 'react'
import KanbanColumn, { KanbanItem } from './KanbanColumn'

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

  const handleDrop = (targetColumn: keyof BoardState) => (cardId: string, fromColumnId: string) => {
    setColumns((prev) => {
      let moved: KanbanItem | undefined
      const next: BoardState = { ...prev }
      
      // Find and remove the card from its current column
      const sourceColumn = fromColumnId as keyof BoardState
      const idx = next[sourceColumn].findIndex((i) => i.id === cardId)
      if (idx !== -1) {
        moved = next[sourceColumn].splice(idx, 1)[0]
      }
      
      // Add the card to the target column
      if (moved && targetColumn !== sourceColumn) {
        next[targetColumn].push(moved)
      }
      
      return { ...next }
    })
  }

  return (
    <main className="container mx-auto py-8 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
      <KanbanColumn 
        id="todo"
        title="Todo" 
        accent="border-orange-500" 
        items={columns.todo} 
        onDrop={handleDrop('todo')} 
      />
      <KanbanColumn 
        id="progress"
        title="In Progress" 
        accent="border-blue-500" 
        items={columns.progress} 
        onDrop={handleDrop('progress')} 
      />
      <KanbanColumn 
        id="done"
        title="Done" 
        accent="border-green-500" 
        items={columns.done} 
        onDrop={handleDrop('done')} 
      />
    </main>
  )
}
