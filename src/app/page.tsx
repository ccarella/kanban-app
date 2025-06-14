'use client'

import { useState, useTransition } from 'react'
import KanbanColumn, { KanbanItem } from '@/components/KanbanColumn'
import { moveCard } from './actions'

interface BoardState {
  todo: KanbanItem[]
  progress: KanbanItem[]
  done: KanbanItem[]
}

const initialState: BoardState = {
  todo: [
    { id: '1', content: 'Add drag & drop' },
    { id: '2', content: 'Style components' },
  ],
  progress: [{ id: '3', content: 'Write docs' }],
  done: [{ id: '4', content: 'Setup project' }],
}

export default function Home() {
  const [columns, setColumns] = useState<BoardState>(initialState)
  const [, startTransition] = useTransition()

  const handleDrop =
    (to: keyof BoardState) =>
    (cardId: string, from: string) => {
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

      startTransition(() => moveCard(cardId, from, to))
    }

  return (
    <main className="min-h-screen bg-neutral-100 p-6 md:p-8 grid auto-cols-fr md:grid-cols-3 gap-6 font-inter">
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
        accent="border-emerald-500"
        items={columns.done}
        onDrop={handleDrop('done')}
      />
    </main>
  )
}
