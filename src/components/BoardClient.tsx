'use client'

import { useState } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
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

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return
    const from = active.data.current?.fromColumnId as keyof BoardState | undefined
    const to = over.id as keyof BoardState | undefined
    if (!from || !to || from === to) return
    const cardId = active.id as string

    setColumns((prev) => {
      let moved: KanbanItem | undefined
      const next: BoardState = { ...prev }
      for (const key of Object.keys(next) as Array<keyof BoardState>) {
        const idx = next[key].findIndex((i) => i.id === cardId)
        if (idx !== -1) {
          moved = next[key].splice(idx, 1)[0]
        }
      }
      if (moved) {
        next[to].push(moved)
      }
      return { ...next }
    })
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <main className="container mx-auto py-8 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
        <KanbanColumn id="todo" title="Todo" accent="border-orange-500" items={columns.todo} />
        <KanbanColumn id="progress" title="In Progress" accent="border-blue-500" items={columns.progress} />
        <KanbanColumn id="done" title="Done" accent="border-emerald-500" items={columns.done} />
      </main>
    </DndContext>
  )
}
