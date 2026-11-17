// Loads a project's full lessons in the browser, as a separate chunk, for
// practice. Kept apart from lessons.ts, which imports every file statically:
// a page that imported that module would carry all the cards in its bundle.

import type { Lessons } from './lessons'

export const loadLessons: Record<string, () => Promise<Lessons>> = {
  'url-shortener': () =>
    import('../../content/lessons/url-shortener.json').then(m => m.default)
}
