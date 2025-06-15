import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test-utils/render'
import CardDetailModal from '../CardDetailModal'
import { mockCard } from '@/test-utils/mock-data'

describe('CardDetailModal', () => {
  const defaultProps = {
    card: mockCard,
    isOpen: true,
    onClose: jest.fn(),
    onUpdateDescription: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders modal with card content when open', () => {
    render(<CardDetailModal {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(mockCard.content)).toBeInTheDocument()
  })

  it('does not render when card is null', () => {
    render(<CardDetailModal {...defaultProps} card={null} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('displays existing description', () => {
    const cardWithDescription = {
      ...mockCard,
      description: 'Existing description',
    }

    render(<CardDetailModal {...defaultProps} card={cardWithDescription} />)

    const textarea = screen.getByPlaceholderText('Add a more detailed description...')
    expect(textarea).toHaveValue('Existing description')
  })

  it('updates description when typing', async () => {
    const mockOnUpdateDescription = jest.fn()
    
    render(
      <CardDetailModal 
        {...defaultProps} 
        onUpdateDescription={mockOnUpdateDescription}
      />
    )

    const textarea = screen.getByPlaceholderText('Add a more detailed description...')
    
    fireEvent.change(textarea, { target: { value: 'New description' } })

    await waitFor(() => {
      expect(mockOnUpdateDescription).toHaveBeenCalledWith(mockCard.id, 'New description')
    })
  })

  it('shows saving state while updating', async () => {
    const mockOnUpdateDescription = jest.fn(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(
      <CardDetailModal 
        {...defaultProps} 
        onUpdateDescription={mockOnUpdateDescription}
      />
    )

    const textarea = screen.getByPlaceholderText('Add a more detailed description...')
    
    fireEvent.change(textarea, { target: { value: 'New description' } })

    // Should show saving text
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    
    // Textarea should be disabled
    expect(textarea).toBeDisabled()

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
    })
    
    expect(textarea).not.toBeDisabled()
  })

  it('updates description when card changes', () => {
    const { rerender } = render(<CardDetailModal {...defaultProps} />)

    const newCard = {
      ...mockCard,
      id: 'card-2',
      content: 'New Card',
      description: 'New card description',
    }

    rerender(<CardDetailModal {...defaultProps} card={newCard} />)

    const textarea = screen.getByPlaceholderText('Add a more detailed description...')
    expect(textarea).toHaveValue('New card description')
  })

  it('handles cards without description', () => {
    const cardWithoutDescription = {
      id: 'card-no-desc',
      content: 'Card without description',
    }

    render(<CardDetailModal {...defaultProps} card={cardWithoutDescription} />)

    const textarea = screen.getByPlaceholderText('Add a more detailed description...')
    expect(textarea).toHaveValue('')
  })
})