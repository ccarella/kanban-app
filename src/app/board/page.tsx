import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

import { BoardClient } from '@/components'
import type { KanbanItem } from '@/components/KanbanColumn'
import { redis } from '@/lib/redis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BoardState {
  todo: KanbanItem[]
  progress: KanbanItem[]
  done: KanbanItem[]
}

const getBoard = unstable_cache(async () => {
  if (!redis) return { todo: [], progress: [], done: [] }
  try {
    const data = await redis.get<BoardState>('board')
    if (data) return data
  } catch {
    return { todo: [], progress: [], done: [] }
  }
  return { todo: [], progress: [], done: [] }
}, ['board'])

async function Board() {
  const board = await getBoard()
  return <BoardClient initialData={board} />
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
