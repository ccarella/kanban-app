'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { KanbanItem } from './KanbanColumn'

interface CardDetailModalProps {
  card: KanbanItem | null
  isOpen: boolean
  onClose: () => void
  onUpdateDescription: (cardId: string, description: string) => void
}

export default function CardDetailModal({
  card,
  isOpen,
  onClose,
  onUpdateDescription,
}: CardDetailModalProps) {
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (card) {
      setDescription(card.description || '')
    }
  }, [card])

  const handleDescriptionChange = async (value: string) => {
    setDescription(value)
    if (card) {
      setIsSaving(true)
      try {
        await onUpdateDescription(card.id, value)
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (!card) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{card.content}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <label htmlFor="description" className="text-sm font-medium text-foreground block mb-2">
            Description/Prompt
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Add a more detailed description..."
            className="w-full min-h-[150px] p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-ring focus:border-transparent"
            disabled={isSaving}
          />
          {isSaving && (
            <p className="text-sm text-muted-foreground mt-1">Saving...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}