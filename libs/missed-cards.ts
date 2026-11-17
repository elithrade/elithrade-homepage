// The cards a visitor missed in practice, kept in their browser's
// localStorage per project. It is a convenience: when storage is blocked the
// pages still work and simply remember nothing.
//
// useSyncExternalStore renders the server's empty list first and the stored
// one after hydration, so the server and client HTML always match.

import { useCallback, useMemo, useSyncExternalStore } from 'react'

export const missedKey = (projectId: string) => `lessons:missed:${projectId}`

const EMPTY: readonly string[] = []
const listeners = new Set<() => void>()
// The last value read per key, so the snapshot keeps its identity while the
// stored text is unchanged (useSyncExternalStore requires that).
const cache = new Map<string, { raw: string | null; ids: readonly string[] }>()

const parse = (raw: string | null): readonly string[] => {
  if (raw === null) return EMPTY
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === 'string')
      : EMPTY
  } catch {
    return EMPTY
  }
}

const read = (key: string): readonly string[] => {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(key)
  } catch {
    return EMPTY
  }
  const cached = cache.get(key)
  if (cached && cached.raw === raw) return cached.ids
  const ids = parse(raw)
  cache.set(key, { raw, ids })
  return ids
}

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

export const useMissedCards = (projectId: string) => {
  const key = missedKey(projectId)
  const ids = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY
  )
  const missed = useMemo(() => new Set(ids), [ids])

  /** Records a practice result: a missed card is kept, a known one dropped. */
  const record = useCallback(
    (cardId: string, wasMissed: boolean) => {
      const next = new Set(read(key))
      if (wasMissed) next.add(cardId)
      else next.delete(cardId)
      try {
        localStorage.setItem(key, JSON.stringify([...next]))
      } catch {
        return
      }
      listeners.forEach(l => l())
    },
    [key]
  )

  return { missed, record }
}
