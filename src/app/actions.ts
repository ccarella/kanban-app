'use server'

import { revalidatePath } from 'next/cache'
import { redis } from '@/lib/redis'
import { KanbanItem } from '@/components/KanbanColumn'

interface BoardState {
  todo: KanbanItem[]
  progress: KanbanItem[]
  done: KanbanItem[]
}

export async function moveCard(
  cardId: string,
  fromColumnId: string,
  toColumnId: string
) {
  if (!redis) {
    console.warn('Redis client not configured - changes will not persist')
    return
  }

  try {
    // Get current board state
    const board = await redis.get<BoardState>('board') || {
      todo: [],
      progress: [],
      done: []
    }

    // Find and move the card
    const fromColumn = board[fromColumnId as keyof BoardState]
    const cardIndex = fromColumn.findIndex(item => item.id === cardId)
    
    if (cardIndex !== -1) {
      const [movedCard] = fromColumn.splice(cardIndex, 1)
      const toColumn = board[toColumnId as keyof BoardState]
      toColumn.push(movedCard)
      
      // Save updated board state
      await redis.set('board', board)
    }

    // Revalidate the board page cache
    revalidatePath('/board')
  } catch (error) {
    console.error('Failed to move card:', error)
  }
}

export async function addCard(content: string, columnId: string) {
  if (!redis) {
    console.warn('Redis client not configured - changes will not persist')
    return
  }

  try {
    // Get current board state
    const board = await redis.get<BoardState>('board') || {
      todo: [],
      progress: [],
      done: []
    }

    // Create new card
    const newCard: KanbanItem = {
      id: `card-${Date.now()}`,
      content: content
    }

    // Add to the specified column
    const column = board[columnId as keyof BoardState]
    column.push(newCard)

    // Save updated board state
    await redis.set('board', board)

    // Revalidate the board page cache
    revalidatePath('/board')
  } catch (error) {
    console.error('Failed to add card:', error)
  }
}

export async function getBoard(): Promise<BoardState> {
  if (!redis) {
    console.warn('Redis client not configured - returning default board')
    return {
      todo: [],
      progress: [],
      done: []
    }
  }

  try {
    const board = await redis.get<BoardState>('board')
    
    // If no board exists, create one with initial data
    if (!board) {
      const initialBoard: BoardState = {
        todo: [
          { id: '1', content: 'Add drag & drop' },
          { id: '2', content: 'Style components' },
        ],
        progress: [{ id: '3', content: 'Write docs' }],
        done: [{ id: '4', content: 'Setup project' }],
      }
      await redis.set('board', initialBoard)
      return initialBoard
    }
    
    return board
  } catch (error) {
    console.error('Failed to get board:', error)
    return {
      todo: [],
      progress: [],
      done: []
    }
  }
}
