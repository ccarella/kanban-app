'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import KanbanColumn, { KanbanItem } from '@/components/KanbanColumn'
import { moveCard, addCard } from './actions'

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

const STORAGE_KEY = 'board-state'

export default function Home() {
  const [columns, setColumns] = useState<BoardState>(initialState)
  const [, startTransition] = useTransition()

  // Configure sensors with activation constraints
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px of movement required to start drag
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // 250ms press & hold to start drag
      tolerance: 5, // 5px movement tolerance during delay
    },
  })

  const sensors = useSensors(mouseSensor, touchSensor)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as BoardState
        setColumns(parsed)
      } catch {
        // ignore parse errors and use default state
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
  }, [columns])

  const handleAddCard = (content: string) => {
    const newCard: KanbanItem = {
      id: `card-${Date.now()}`,
      content: content
    }
    
    setColumns(prev => ({
      ...prev,
      todo: [...prev.todo, newCard]
    }))

    // Persist to database if Redis is configured
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
      if (moved) {
        next[toColumn].push(moved)
      }
      
      return { ...next }
    })

    startTransition(() => moveCard(cardId, fromColumnId, toColumnId))
  }

  const lists = [
    { id: 'todo', name: 'Todo', accent: 'border-orange-500', items: columns.todo },
    { id: 'progress', name: 'In Progress', accent: 'border-blue-500', items: columns.progress },
    { id: 'done', name: 'Done', accent: 'border-emerald-500', items: columns.done },
  ]

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <main className="min-h-screen bg-neutral-100 p-6 md:p-8 grid auto-cols-fr md:grid-cols-3 gap-6 font-sans">
        {lists.map((list) => (
          <KanbanColumn
            key={list.id}
            id={list.id}
            title={list.name}
            accent={list.accent}
            items={list.items}
            onAddCard={list.id === 'todo' ? handleAddCard : undefined}
          />
        ))}
      </main>
    </DndContext>
  )
}
