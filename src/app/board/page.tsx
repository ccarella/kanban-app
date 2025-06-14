import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

import { KanbanColumn } from '@/components'
import type { KanbanItem } from '@/components/KanbanColumn'
import { redis } from '@/lib/redis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BoardState {
  todo: KanbanItem[]
  progress: KanbanItem[]
  done: KanbanItem[]
}

const getBoard = unstable_cache(async () => {
  const data = await redis.get<BoardState>('board')
  if (data) return data
  return { todo: [], progress: [], done: [] }
}, ['board'])

async function Board() {
  const board = await getBoard()
  return (
    <main className="container mx-auto py-8 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
      <KanbanColumn title="Todo" items={board.todo} onDrop={() => {}} />
      <KanbanColumn title="In Progress" items={board.progress} onDrop={() => {}} />
      <KanbanColumn title="Done" items={board.done} onDrop={() => {}} />
    </main>
  )
}

function ColumnSkeleton() {
  return (
    <Card className="bg-muted/50">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-sm font-medium">
          <span className="opacity-0">Loading</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-20 rounded-md bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}

function BoardSkeleton() {
  return (
    <main className="container mx-auto py-8 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
      <ColumnSkeleton />
      <ColumnSkeleton />
      <ColumnSkeleton />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <Board />
    </Suspense>
  )
}
