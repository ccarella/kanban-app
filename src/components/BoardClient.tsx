'use client'

import { useState, useTransition } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import KanbanColumn, { KanbanItem } from './KanbanColumn'
import CardDetailModal from './CardDetailModal'
import { moveCard, addCard, updateCardDescription } from '@/app/actions'

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
  const [selectedCard, setSelectedCard] = useState<KanbanItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [, startTransition] = useTransition()

  const handleCardClick = (card: KanbanItem) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const handleUpdateDescription = async (cardId: string, description: string) => {
    // Update local state
    setColumns(prev => {
      const newState = { ...prev }
      for (const columnKey of Object.keys(newState) as Array<keyof BoardState>) {
        const cardIndex = newState[columnKey].findIndex(card => card.id === cardId)
        if (cardIndex !== -1) {
          newState[columnKey][cardIndex] = { 
            ...newState[columnKey][cardIndex], 
            description 
          }
          break
        }
      }
      return newState
    })

    // Update selected card
    if (selectedCard?.id === cardId) {
      setSelectedCard({ ...selectedCard, description })
    }

    // Persist to database
    await updateCardDescription(cardId, description)
  }

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

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        <main className="container mx-auto py-8 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
          <KanbanColumn 
            id="todo"
            title="Todo" 
            accent="border-orange-500" 
            items={columns.todo}
            onAddCard={handleAddCard}
            onCardClick={handleCardClick}
          />
          <KanbanColumn 
            id="progress"
            title="In Progress" 
            accent="border-blue-500" 
            items={columns.progress}
            onCardClick={handleCardClick}
          />
          <KanbanColumn 
            id="done"
            title="Done" 
            accent="border-green-500" 
            items={columns.done}
            onCardClick={handleCardClick}
          />
        </main>
      </DndContext>
      <CardDetailModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateDescription={handleUpdateDescription}
      />
    </>
  )
}
