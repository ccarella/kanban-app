'use server'

import { redis } from '@/lib/redis'
import { columnCardsKey } from '@/lib/models'

export async function moveCard(
  cardId: string,
  fromColumnId: string,
  toColumnId: string
) {
  if (!redis) {
    throw new Error('Redis client not configured')
  }
  // remove card from its previous column
  await redis.lrem(columnCardsKey(fromColumnId), 0, cardId)
  // add card to the new column
  await redis.rpush(columnCardsKey(toColumnId), cardId)
}
