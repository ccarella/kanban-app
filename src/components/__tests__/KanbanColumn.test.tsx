import React from 'react'
import { render, screen, fireEvent } from '@/test-utils/render'
import KanbanColumn from '../KanbanColumn'
import { useDroppable } from '@dnd-kit/core'
import { mockCard } from '@/test-utils/mock-data'

// Mock @dnd-kit/core
jest.mock('@dnd-kit/core', () => ({
  useDroppable: jest.fn(),
  useDraggable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    isDragging: false,
  })),
}))

describe('KanbanColumn', () => {
  const mockUseDroppable = useDroppable as jest.MockedFunction<typeof useDroppable>
  
  const mockItems = [
    { ...mockCard, id: '1', content: 'Task 1' },
    { ...mockCard, id: '2', content: 'Task 2', description: 'Task 2 description' },
  ]

  const defaultProps = {
    id: 'col-1',
    title: 'To Do',
    accent: 'border-blue-500',
    items: mockItems,
  }

  beforeEach(() => {
    mockUseDroppable.mockReturnValue({
      setNodeRef: jest.fn(),
      isOver: false,
      active: null,
      over: null,
      rect: null,
      disabled: false,
      data: null,
    } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders column with title and items', () => {
    render(<KanbanColumn {...defaultProps} />)

    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })

  it('shows input field when onAddCard is provided', () => {
    const mockOnAddCard = jest.fn()
    
    render(<KanbanColumn {...defaultProps} onAddCard={mockOnAddCard} />)

    const input = screen.getByPlaceholderText('Type and press Enter to add a card...')
    expect(input).toBeInTheDocument()
  })

  it('does not show input field when onAddCard is not provided', () => {
    render(<KanbanColumn {...defaultProps} />)

    const input = screen.queryByPlaceholderText('Type and press Enter to add a card...')
    expect(input).not.toBeInTheDocument()
  })

  it('adds a new card when Enter is pressed', () => {
    const mockOnAddCard = jest.fn()
    
    render(<KanbanColumn {...defaultProps} onAddCard={mockOnAddCard} />)

    const input = screen.getByPlaceholderText('Type and press Enter to add a card...')
    
    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

    expect(mockOnAddCard).toHaveBeenCalledWith('New Task')
    expect(input).toHaveValue('')
  })

  it('does not add card when Enter is pressed with Shift', () => {
    const mockOnAddCard = jest.fn()
    
    render(<KanbanColumn {...defaultProps} onAddCard={mockOnAddCard} />)

    const input = screen.getByPlaceholderText('Type and press Enter to add a card...')
    
    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

    expect(mockOnAddCard).not.toHaveBeenCalled()
    expect(input).toHaveValue('New Task')
  })

  it('does not add empty card', () => {
    const mockOnAddCard = jest.fn()
    
    render(<KanbanColumn {...defaultProps} onAddCard={mockOnAddCard} />)

    const input = screen.getByPlaceholderText('Type and press Enter to add a card...')
    
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

    expect(mockOnAddCard).not.toHaveBeenCalled()
  })

  it('calls onCardClick when a card is clicked', () => {
    const mockOnCardClick = jest.fn()
    
    render(<KanbanColumn {...defaultProps} onCardClick={mockOnCardClick} />)

    fireEvent.click(screen.getByText('Task 1'))

    expect(mockOnCardClick).toHaveBeenCalledWith(mockItems[0])
  })

  it('applies the correct accent color', () => {
    const { container } = render(<KanbanColumn {...defaultProps} />)

    const header = container.querySelector('.border-blue-500')
    expect(header).toBeInTheDocument()
  })

  it('initializes droppable with correct id', () => {
    render(<KanbanColumn {...defaultProps} />)

    expect(mockUseDroppable).toHaveBeenCalledWith({
      id: 'col-1',
    })
  })
})