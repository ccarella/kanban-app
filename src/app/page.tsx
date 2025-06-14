import { Suspense } from 'react'
import { BoardClient } from '@/components'
import { getBoard } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

export default function Home() {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <Board />
    </Suspense>
  )
}
