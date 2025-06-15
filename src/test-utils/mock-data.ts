import { KanbanItem } from '@/components/KanbanColumn'

export const mockCard: KanbanItem = {
  id: 'card-1',
  content: 'Test Card',
  description: 'Test Description',
}

// Note: BoardState doesn't seem to be defined, removing this export

export const mockBoard = {
  id: 'board-1',
  columns: [
    {
      id: 'col-1',
      name: 'To Do',
      cards: [
        {
          id: 'card-1',
          content: 'Task 1',
          description: 'Description 1',
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