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

  const handleDrop = (column: keyof BoardState) => (id: string) => {
    setColumns((prev) => {
      let moved: KanbanItem | undefined
      const next: BoardState = { ...prev }
      for (const key of Object.keys(next) as Array<keyof BoardState>) {
        const idx = next[key].findIndex((i) => i.id === id)
        if (idx !== -1) {
          moved = next[key].splice(idx, 1)[0]
        }
      }
      if (moved) {
        next[column].push(moved)
      }
      return { ...next }
    })
  }

  return (
    <main className="container mx-auto py-8 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
      <KanbanColumn title="Todo" items={columns.todo} onDrop={handleDrop('todo')} />
      <KanbanColumn title="In Progress" items={columns.progress} onDrop={handleDrop('progress')} />
      <KanbanColumn title="Done" items={columns.done} onDrop={handleDrop('done')} />
    </main>
  )
}
