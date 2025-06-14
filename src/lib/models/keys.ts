export type BoardKey = `boards:${string}`
export type BoardColumnsKey = `boards:${string}:columns`
export type ColumnKey = `columns:${string}`
export type ColumnCardsKey = `columns:${string}:cards`
export type CardKey = `cards:${string}`

export function boardKey(boardId: string): BoardKey {
  return `boards:${boardId}`
}

export function boardColumnsKey(boardId: string): BoardColumnsKey {
  return `boards:${boardId}:columns`
}

export function columnKey(columnId: string): ColumnKey {
  return `columns:${columnId}`
}

export function columnCardsKey(columnId: string): ColumnCardsKey {
  return `columns:${columnId}:cards`
}

export function cardKey(cardId: string): CardKey {
  return `cards:${cardId}`
}
