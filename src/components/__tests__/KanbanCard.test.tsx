import React from 'react'
import { render, screen, fireEvent } from '@/test-utils/render'
import KanbanCard from '../KanbanCard'
import { useDraggable } from '@dnd-kit/core'

// Mock @dnd-kit/core
jest.mock('@dnd-kit/core', () => ({
  useDraggable: jest.fn(),
}))

describe('KanbanCard', () => {
  const mockUseDraggable = useDraggable as jest.MockedFunction<typeof useDraggable>
  
  const defaultProps = {
    id: 'card-1',
    columnId: 'col-1',
    description: 'Test description',
  }

  beforeEach(() => {
    mockUseDraggable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      isDragging: false,
      transform: null,
      node: null,
      over: null,
      active: null,
      activatorEvent: null,
      rect: null,
      disabled: false,
      data: null,
      activators: [],
    } as ReturnType<typeof useDraggable>)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders card with children', () => {
    render(
      <KanbanCard {...defaultProps}>
        <div>Test Card Content</div>
      </KanbanCard>
    )

    expect(screen.getByText('Test Card Content')).toBeInTheDocument()
  })

  it('expands and shows description when clicked', () => {
    render(
      <KanbanCard {...defaultProps}>
        <div>Test Card</div>
      </KanbanCard>
    )

    // Description should not be visible initially
    expect(screen.queryByText('Details:')).not.toBeInTheDocument()

    // Click to expand
    fireEvent.click(screen.getByText('Test Card'))

    // Description should now be visible
    expect(screen.getByText('Details:')).toBeInTheDocument()
    expect(screen.getByText('Create a new branch for this feature. Implement it, create Tests when relevant, run no test and fix any broken tests, give me a summary of what was done, update Claude.md with anything relevant for future development (but be picky and brief), make a PR, monitor the PR\'s tests, if they fail fix them and try again, if they succeed let me know the branch is safe to be merged.')).toBeInTheDocument()
  })

  it('applies dragging styles when being dragged', () => {
    mockUseDraggable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      isDragging: true,
      transform: null,
      node: null,
      over: null,
      active: null,
      activatorEvent: null,
      rect: null,
      disabled: false,
      data: null,
      activators: [],
    } as ReturnType<typeof useDraggable>)

    const { container } = render(
      <KanbanCard {...defaultProps}>
        <div>Test Card</div>
      </KanbanCard>
    )

    const cardElement = container.querySelector('.ring-2.ring-ring.cursor-grabbing')
    expect(cardElement).toBeInTheDocument()
  })

  it('prevents click handler during drag', () => {
    const mockOnClick = jest.fn()
    
    mockUseDraggable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      isDragging: true,
      transform: null,
      node: null,
      over: null,
      active: null,
      activatorEvent: null,
      rect: null,
      disabled: false,
      data: null,
      activators: [],
    } as ReturnType<typeof useDraggable>)

    render(
      <KanbanCard {...defaultProps} onClick={mockOnClick}>
        <div>Test Card</div>
      </KanbanCard>
    )

    fireEvent.click(screen.getByText('Test Card'))

    // onClick should not be called during drag
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('calls onClick handler when not dragging', () => {
    const mockOnClick = jest.fn()

    render(
      <KanbanCard {...defaultProps} onClick={mockOnClick}>
        <div>Test Card</div>
      </KanbanCard>
    )

    fireEvent.click(screen.getByText('Test Card'))

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('initializes draggable with correct data', () => {
    render(
      <KanbanCard {...defaultProps}>
        <div>Test Card</div>
      </KanbanCard>
    )

    expect(mockUseDraggable).toHaveBeenCalledWith({
      id: 'card-1',
      data: {
        columnId: 'col-1',
      },
    })
  })
})