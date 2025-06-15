import { moveCard, addCard, resetBoard, updateCardDescription, getBoard } from '../actions'
import { redis } from '@/lib/redis'
import { revalidatePath } from 'next/cache'

// Mock dependencies
jest.mock('@/lib/redis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    lrange: jest.fn(),
  }
  return { redis: mockRedis }
})

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Server Actions', () => {
  const mockRedis = redis as jest.Mocked<typeof redis>
  const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>

  const mockBoard = {
    todo: [
      { id: '1', content: 'Task 1', description: 'Description 1' },
      { id: '2', content: 'Task 2' },
    ],
    progress: [
      { id: '3', content: 'Task 3' },
    ],
    done: [
      { id: '4', content: 'Task 4' },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock board state
    const freshMockBoard = JSON.parse(JSON.stringify(mockBoard))
    // Default mock for redis.get to return the mock board
    mockRedis.get.mockResolvedValue(freshMockBoard)
  })

  describe('moveCard', () => {
    it('moves a card from one column to another', async () => {
      await moveCard('1', 'todo', 'progress')

      // Verify Redis operations
      expect(mockRedis.get).toHaveBeenCalledWith('board')
      expect(mockRedis.set).toHaveBeenCalledWith('board', {
        todo: [{ id: '2', content: 'Task 2' }],
        progress: [
          { id: '3', content: 'Task 3' },
          { id: '1', content: 'Task 1', description: 'Description 1' },
        ],
        done: [{ id: '4', content: 'Task 4' }],
      })

      // Verify paths are revalidated
      expect(mockRevalidatePath).toHaveBeenCalledWith('/board')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('handles missing board gracefully', async () => {
      mockRedis.get.mockResolvedValue(null)

      await moveCard('1', 'todo', 'progress')

      // Should create a new board
      expect(mockRedis.set).toHaveBeenCalledWith('board', {
        todo: [],
        progress: [],
        done: [],
      })
    })

    it('handles invalid column IDs', async () => {
      await moveCard('1', 'invalid', 'progress')

      // Should not update the board
      expect(mockRedis.set).not.toHaveBeenCalled()
    })

    it('handles non-existent card gracefully', async () => {
      await moveCard('999', 'todo', 'progress')

      // Should not update the board
      expect(mockRedis.set).not.toHaveBeenCalled()
    })
  })

  describe('addCard', () => {
    it('adds a new card to the specified column', async () => {
      await addCard('New Task', 'todo')

      // Verify the card was added
      const setCall = mockRedis.set.mock.calls[0]
      expect(setCall[0]).toBe('board')
      const updatedBoard = setCall[1] as any
      expect(updatedBoard.todo).toHaveLength(3)
      expect(updatedBoard.todo[2].content).toBe('New Task')
      expect(updatedBoard.todo[2].id).toMatch(/^card-\d+-[a-z0-9]+$/)

      // Verify paths are revalidated
      expect(mockRevalidatePath).toHaveBeenCalledWith('/board')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('creates a new board if none exists', async () => {
      mockRedis.get.mockResolvedValue(null)

      await addCard('New Task', 'todo')

      // Should create a new board with the card
      const setCall = mockRedis.set.mock.calls[0]
      const newBoard = setCall[1] as any
      expect(newBoard.todo).toHaveLength(1)
      expect(newBoard.todo[0].content).toBe('New Task')
    })

    it('handles invalid column ID', async () => {
      await addCard('New Task', 'invalid')

      // Should not update the board
      expect(mockRedis.set).not.toHaveBeenCalled()
    })
  })

  describe('updateCardDescription', () => {
    it('updates card description', async () => {
      await updateCardDescription('1', 'Updated description')

      // Verify the description was updated
      expect(mockRedis.set).toHaveBeenCalledWith('board', {
        todo: [
          { id: '1', content: 'Task 1', description: 'Updated description' },
          { id: '2', content: 'Task 2' },
        ],
        progress: [{ id: '3', content: 'Task 3' }],
        done: [{ id: '4', content: 'Task 4' }],
      })

      // Verify paths are revalidated
      expect(mockRevalidatePath).toHaveBeenCalledWith('/board')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('finds card in any column', async () => {
      await updateCardDescription('3', 'Progress task description')

      // Verify the description was updated in the progress column
      const setCall = mockRedis.set.mock.calls[0]
      const updatedBoard = setCall[1] as any
      expect(updatedBoard.progress[0].description).toBe('Progress task description')
    })

    it('handles non-existent card', async () => {
      await updateCardDescription('999', 'Description')

      // Should not update the board
      expect(mockRedis.set).not.toHaveBeenCalled()
    })
  })

  describe('resetBoard', () => {
    it('resets the board to initial state', async () => {
      await resetBoard()

      // Verify old keys are deleted
      expect(mockRedis.del).toHaveBeenCalledWith('board')
      expect(mockRedis.del).toHaveBeenCalledWith('columns:todo:cards')
      expect(mockRedis.del).toHaveBeenCalledWith('columns:progress:cards')
      expect(mockRedis.del).toHaveBeenCalledWith('columns:done:cards')

      // Verify new board is created
      const setCall = mockRedis.set.mock.calls[0]
      const newBoard = setCall[1] as any
      expect(newBoard.todo).toHaveLength(2)
      expect(newBoard.progress).toHaveLength(1)
      expect(newBoard.done).toHaveLength(1)

      // Verify paths are revalidated
      expect(mockRevalidatePath).toHaveBeenCalledWith('/board')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })
  })

  describe('getBoard', () => {
    it('returns the board from Redis', async () => {
      const board = await getBoard()

      expect(mockRedis.get).toHaveBeenCalledWith('board')
      expect(board).toEqual(mockBoard)
    })

    it('creates initial board if none exists', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockRedis.lrange.mockResolvedValue([])

      const board = await getBoard()

      // Should create and save initial board
      expect(mockRedis.set).toHaveBeenCalled()
      const setCall = mockRedis.set.mock.calls[0]
      const newBoard = setCall[1] as any
      expect(newBoard.todo).toHaveLength(2)
      expect(newBoard.progress).toHaveLength(1)
      expect(newBoard.done).toHaveLength(1)
    })

    it('migrates from old key structure', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockRedis.lrange
        .mockResolvedValueOnce(['card-1', 'card-2']) // todo
        .mockResolvedValueOnce(['card-3']) // progress
        .mockResolvedValueOnce(['card-4']) // done

      const board = await getBoard()

      // Should migrate old structure
      expect(mockRedis.lrange).toHaveBeenCalledWith('columns:todo:cards', 0, -1)
      expect(mockRedis.lrange).toHaveBeenCalledWith('columns:progress:cards', 0, -1)
      expect(mockRedis.lrange).toHaveBeenCalledWith('columns:done:cards', 0, -1)

      // Should save migrated board
      const setCall = mockRedis.set.mock.calls[0]
      const migratedBoard = setCall[1] as any
      expect(migratedBoard.todo).toHaveLength(2)
      expect(migratedBoard.todo[0].id).toBe('card-1')
      expect(migratedBoard.todo[0].content).toBe('Card card-1')
    })

    it('returns empty board on error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'))

      const board = await getBoard()

      expect(board).toEqual({
        todo: [],
        progress: [],
        done: [],
      })
    })
  })

  describe('Redis not configured', () => {
    let originalRedis: any

    beforeEach(() => {
      // Store original redis mock
      originalRedis = require('@/lib/redis').redis
      // Set redis to null
      require('@/lib/redis').redis = null
    })

    afterEach(() => {
      // Restore redis mock
      require('@/lib/redis').redis = originalRedis
    })

    it('handles missing Redis client in moveCard', async () => {
      await expect(moveCard('1', 'todo', 'progress')).resolves.not.toThrow()
    })

    it('handles missing Redis client in addCard', async () => {
      await expect(addCard('New Task', 'todo')).resolves.not.toThrow()
    })

    it('returns default board when Redis not configured', async () => {
      const board = await getBoard()
      expect(board).toEqual({
        todo: [],
        progress: [],
        done: [],
      })
    })
  })
})