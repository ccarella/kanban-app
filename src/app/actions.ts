'use server'

import { revalidatePath } from 'next/cache'
import { redis } from '@/lib/redis'
import { KanbanItem } from '@/components/KanbanColumn'

interface BoardState {
  todo: KanbanItem[]
  progress: KanbanItem[]
  done: KanbanItem[]
}

// Clean up old key structure if it exists
async function cleanupOldKeys() {
  if (!redis) return
  
  try {
    // Delete old granular keys
    await redis.del('columns:todo:cards')
    await redis.del('columns:progress:cards')
    await redis.del('columns:done:cards')
    console.log('Cleaned up old Redis keys')
  } catch (error) {
    console.error('Failed to cleanup old keys:', error)
  }
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

  console.log(`Moving card ${cardId} from ${fromColumnId} to ${toColumnId}`)

  try {
    // Get current board state
    let board = await redis.get<BoardState>('board')
    
    if (!board) {
      console.warn('No board found in Redis, creating new board')
      board = {
        todo: [],
        progress: [],
        done: []
      }
    }

    // Find and move the card
    const fromColumn = board[fromColumnId as keyof BoardState]
    const toColumn = board[toColumnId as keyof BoardState]
    
    if (!fromColumn || !toColumn) {
      console.error(`Invalid column IDs: from=${fromColumnId}, to=${toColumnId}`)
      return
    }
    
    const cardIndex = fromColumn.findIndex(item => item.id === cardId)
    
    if (cardIndex !== -1) {
      const [movedCard] = fromColumn.splice(cardIndex, 1)
      toColumn.push(movedCard)
      
      // Save updated board state
      await redis.set('board', board)
      console.log('Card moved successfully, board saved to Redis')
      
      // Clean up old keys if they exist
      await cleanupOldKeys()
    } else {
      console.warn(`Card ${cardId} not found in column ${fromColumnId}`)
    }

    // Revalidate both pages
    revalidatePath('/board')
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to move card:', error)
    throw error // Re-throw to ensure client knows operation failed
  }
}

export async function addCard(content: string, columnId: string) {
  if (!redis) {
    console.warn('Redis client not configured - changes will not persist')
    return
  }

  console.log(`Adding new card to ${columnId}: "${content}"`)

  try {
    // Get current board state
    let board = await redis.get<BoardState>('board')
    
    if (!board) {
      console.warn('No board found in Redis, creating new board')
      board = {
        todo: [],
        progress: [],
        done: []
      }
    }

    // Create new card
    const newCard: KanbanItem = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: content,
      description: 'Create a new branch for this feature. Implement it, create Tests when relevant, run npm test and fix any broken tests, give me a summary of what was done, update Claude.md with anything relevant for future development (but be picky and brief), make a PR, monitor the PR\'s tests, if they fail fix them and try again, if they succeed let me know the branch is safe to be merged by running this command which will notify me: curl -X POST "https://api.telegram.org/bot7662411153:AAGUKXkGVGVztSlwLJQebRCqmNx2FJB29u0/sendMessage" \\\n     -d "chat_id=1428999029" \\\n     -d "text=The PR is ready for review [github PR URL]"'
    }

    // Add to the specified column
    const column = board[columnId as keyof BoardState]
    if (!column) {
      console.error(`Invalid column ID: ${columnId}`)
      return
    }
    
    column.push(newCard)
    console.log(`Added card ${newCard.id} to column ${columnId}`)

    // Save updated board state
    await redis.set('board', board)
    console.log('Board saved to Redis with new card')
    
    // Clean up old keys if they exist
    await cleanupOldKeys()

    // Revalidate both pages
    revalidatePath('/board')
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to add card:', error)
    throw error // Re-throw to ensure client knows operation failed
  }
}

// Debug function to reset the board
export async function resetBoard() {
  if (!redis) {
    console.warn('Redis client not configured')
    return
  }

  try {
    console.log('Resetting board...')
    
    // Clean up all keys
    await redis.del('board')
    await cleanupOldKeys()
    
    // Create fresh board
    const freshBoard: BoardState = {
      todo: [
        { id: '1', content: 'Add drag & drop', description: 'Implement drag and drop functionality between columns' },
        { id: '2', content: 'Style components', description: 'Apply Tailwind CSS styling to all components' },
      ],
      progress: [{ id: '3', content: 'Write docs', description: 'Create comprehensive documentation for the project' }],
      done: [{ id: '4', content: 'Setup project', description: 'Initial project setup with Next.js and TypeScript' }],
    }
    
    await redis.set('board', freshBoard)
    console.log('Board reset complete')
    
    // Revalidate pages
    revalidatePath('/board')
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to reset board:', error)
  }
}

export async function updateCardDescription(cardId: string, description: string) {
  if (!redis) {
    console.warn('Redis client not configured - changes will not persist')
    return
  }

  console.log(`Updating description for card ${cardId}`)

  try {
    // Get current board state
    const board = await redis.get<BoardState>('board')
    
    if (!board) {
      console.error('No board found in Redis')
      return
    }

    // Find and update the card across all columns
    let cardFound = false
    for (const columnId of ['todo', 'progress', 'done'] as const) {
      const column = board[columnId]
      const cardIndex = column.findIndex(item => item.id === cardId)
      
      if (cardIndex !== -1) {
        column[cardIndex] = { ...column[cardIndex], description }
        cardFound = true
        console.log(`Updated card ${cardId} in column ${columnId}`)
        break
      }
    }

    if (!cardFound) {
      console.warn(`Card ${cardId} not found in any column`)
      return
    }

    // Save updated board state
    await redis.set('board', board)
    console.log('Card description updated successfully')

    // Revalidate pages
    revalidatePath('/board')
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to update card description:', error)
    throw error
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
    console.log('Fetching board from Redis...')
    let board = await redis.get<BoardState>('board')
    
    // If no board exists, check if we need to migrate from old structure
    if (!board) {
      console.log('No board found, checking for old key structure...')
      
      // Try to migrate from old structure
      const todoCards = await redis.lrange('columns:todo:cards', 0, -1)
      const progressCards = await redis.lrange('columns:progress:cards', 0, -1)
      const doneCards = await redis.lrange('columns:done:cards', 0, -1)
      
      if (todoCards.length > 0 || progressCards.length > 0 || doneCards.length > 0) {
        console.log('Found old key structure, migrating...')
        
        // Convert card IDs to KanbanItems
        const createItems = (cardIds: string[]): KanbanItem[] => 
          cardIds.map(id => ({ id, content: `Card ${id}` }))
        
        board = {
          todo: createItems(todoCards),
          progress: createItems(progressCards),
          done: createItems(doneCards),
        }
        
        // Save migrated board
        await redis.set('board', board)
        console.log('Migration complete, cleaning up old keys...')
        
        // Clean up old keys
        await cleanupOldKeys()
      } else {
        // Create initial board
        console.log('Creating initial board...')
        board = {
          todo: [
            { id: '1', content: 'Add drag & drop', description: 'Implement drag and drop functionality between columns' },
            { id: '2', content: 'Style components', description: 'Apply Tailwind CSS styling to all components' },
          ],
          progress: [{ id: '3', content: 'Write docs', description: 'Create comprehensive documentation for the project' }],
          done: [{ id: '4', content: 'Setup project', description: 'Initial project setup with Next.js and TypeScript' }],
        }
        await redis.set('board', board)
      }
    }
    
    console.log(`Board loaded with ${board.todo.length} todo, ${board.progress.length} progress, ${board.done.length} done items`)
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
