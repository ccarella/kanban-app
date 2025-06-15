import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test-utils/render'
import KanbanCard from '../KanbanCard'
import { useDraggable } from '@dnd-kit/core'

// Mock @dnd-kit/core
jest.mock('@dnd-kit/core', () => ({
  useDraggable: jest.fn(),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
})

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
    expect(screen.getByText('Test description')).toBeInTheDocument()
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

  it('does not show expandable content when no description is provided', () => {
    render(
      <KanbanCard id="card-1" columnId="col-1">
        <div>Test Card</div>
      </KanbanCard>
    )

    // Click to expand
    fireEvent.click(screen.getByText('Test Card'))

    // No description content should be shown
    expect(screen.queryByText('Details:')).not.toBeInTheDocument()
  })

  it('copies card details to clipboard when copy button is clicked', async () => {
    const writeTextMock = jest.spyOn(navigator.clipboard, 'writeText')
    
    render(
      <KanbanCard {...defaultProps} title="Test Title">
        <div>Test Card</div>
      </KanbanCard>
    )

    // Click to expand
    fireEvent.click(screen.getByText('Test Card'))

    // Click copy button
    const copyButton = screen.getByLabelText('Copy card details')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('Feature: Test Title - Test description')
    })
  })

  it('uses children as title when title prop is not provided', async () => {
    const writeTextMock = jest.spyOn(navigator.clipboard, 'writeText')
    
    render(
      <KanbanCard {...defaultProps}>
        <div>Test Card Content</div>
      </KanbanCard>
    )

    // Click to expand
    fireEvent.click(screen.getByText('Test Card Content'))

    // Click copy button
    const copyButton = screen.getByLabelText('Copy card details')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('Feature: Test Card Content - Test description')
    })
  })

  it('handles copy error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const writeTextMock = jest.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Copy failed'))
    
    render(
      <KanbanCard {...defaultProps}>
        <div>Test Card</div>
      </KanbanCard>
    )

    // Click to expand
    fireEvent.click(screen.getByText('Test Card'))

    // Click copy button
    const copyButton = screen.getByLabelText('Copy card details')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy text:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
    writeTextMock.mockRestore()
  })
})