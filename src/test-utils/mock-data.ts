import { KanbanItem, BoardState } from '@/types/kanban'

export const mockCard: KanbanItem = {
  id: 'card-1',
  title: 'Test Card',
  description: 'Test Description',
  priority: 'medium',
  dueDate: '2024-12-25',
  tags: ['test', 'mock'],
}

export const mockColumn: BoardState = {
  id: 'col-1',
  name: 'To Do',
  cards: [mockCard],
}

export const mockBoard = {
  id: 'board-1',
  columns: [
    {
      id: 'col-1',
      name: 'To Do',
      cards: [
        {
          id: 'card-1',
          title: 'Task 1',
          description: 'Description 1',
          priority: 'high',
          dueDate: '2024-12-25',
          tags: ['urgent'],
        },
      ],
    },
    {
      id: 'col-2',
      name: 'In Progress',
      cards: [],
    },
    {
      id: 'col-3',
      name: 'Done',
      cards: [],
    },
  ],
}