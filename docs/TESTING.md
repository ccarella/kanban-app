# Testing Guide

This guide explains how to write and run tests for the Kanban App.

## Testing Setup

The project uses Jest and React Testing Library for testing. The setup includes:

- **Jest**: Testing framework
- **React Testing Library**: For testing React components
- **@testing-library/user-event**: For simulating user interactions
- **TypeScript support**: Via ts-jest

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

Tests are organized alongside the code they test:

```
src/
├── components/
│   ├── KanbanCard.tsx
│   └── __tests__/
│       └── KanbanCard.test.tsx
├── app/
│   ├── actions.ts
│   └── __tests__/
│       └── actions.test.ts
```

## Writing Tests

### Component Tests

Use the custom render function from `test-utils` which includes necessary providers:

```typescript
import { render, screen } from '@/test-utils/render'
import KanbanCard from '../KanbanCard'

describe('KanbanCard', () => {
  it('renders card content', () => {
    render(
      <KanbanCard id="1" columnId="todo">
        Test Card
      </KanbanCard>
    )
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })
})
```

### Testing User Interactions

Use `@testing-library/user-event` for realistic user interactions:

```typescript
import userEvent from '@testing-library/user-event'

it('adds new card when Enter is pressed', async () => {
  const user = userEvent.setup()
  const mockOnAddCard = jest.fn()
  
  render(<KanbanColumn onAddCard={mockOnAddCard} />)
  
  const input = screen.getByPlaceholderText('Type and press Enter...')
  
  await user.type(input, 'New Task')
  await user.keyboard('{Enter}')
  
  expect(mockOnAddCard).toHaveBeenCalledWith('New Task')
})
```

### Testing Drag and Drop

For drag-and-drop functionality, use the mock helpers:

```typescript
import { createMockDragEvent } from '@/test-utils/mock-data'

it('handles drag and drop', () => {
  const dragEvent = createMockDragEvent(
    { id: 'card-1', data: { current: { columnId: 'todo' } } },
    { id: 'progress' }
  )
  
  fireEvent.dragEnd(container, dragEvent)
  
  // Assert the expected behavior
})
```

### Testing Server Actions

Mock server actions and test their integration:

```typescript
import { moveCard } from '@/app/actions'

jest.mock('@/app/actions')

it('calls moveCard action', async () => {
  const mockMoveCard = moveCard as jest.MockedFunction<typeof moveCard>
  
  // Trigger the action
  await handleDragEnd(...)
  
  expect(mockMoveCard).toHaveBeenCalledWith('card-1', 'todo', 'progress')
})
```

## Mock Data

Use the provided mock data factories for consistent test data:

```typescript
import { mockCard, mockBoardState } from '@/test-utils/mock-data'

const testCard = mockCard({
  id: 'test-1',
  content: 'Test Task',
  description: 'Test Description'
})

const testBoard = mockBoardState({
  todo: [testCard],
  progress: [],
  done: []
})
```

## Testing Best Practices

1. **Test behavior, not implementation**: Focus on what the user sees and does
2. **Use data-testid sparingly**: Prefer accessible queries like getByRole, getByText
3. **Mock external dependencies**: Redis, server actions, localStorage
4. **Test error states**: Ensure components handle errors gracefully
5. **Keep tests isolated**: Each test should be independent

## Common Testing Patterns

### Testing Expandable Cards

```typescript
it('expands card on click', () => {
  render(<KanbanCard />)
  
  const card = screen.getByText('Card Title')
  expect(screen.queryByText('Description')).not.toBeInTheDocument()
  
  fireEvent.click(card)
  
  expect(screen.getByText('Description')).toBeInTheDocument()
})
```

### Testing Form Inputs

```typescript
it('clears input after submission', async () => {
  const user = userEvent.setup()
  
  render(<AddCardForm />)
  const input = screen.getByRole('textbox')
  
  await user.type(input, 'New Task')
  await user.keyboard('{Enter}')
  
  expect(input).toHaveValue('')
})
```

### Testing Async Operations

```typescript
it('shows loading state', async () => {
  render(<BoardClient />)
  
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
})
```

## Debugging Tests

1. Use `screen.debug()` to see the current DOM
2. Use `screen.logTestingPlaygroundURL()` to get a Testing Playground link
3. Add `console.log` statements in your tests
4. Run a single test file: `npm test -- KanbanCard.test.tsx`
5. Run tests matching a pattern: `npm test -- --testNamePattern="drag"`

## Coverage Goals

The project aims for:
- 70% statement coverage
- 70% branch coverage
- 70% function coverage
- 70% line coverage

Check coverage with: `npm run test:coverage`

Coverage reports are generated in the `coverage/` directory.