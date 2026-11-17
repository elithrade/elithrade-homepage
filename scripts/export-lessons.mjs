// Exports a project's LESSONS.md as content/lessons/<id>.json.
//
//   node scripts/export-lessons.mjs <LESSONS.md> <out.json> \
//     --id url-shortener --name url-shortener \
//     --description '...' --source https://github.com/.../LESSONS.md
//
// Needs no npm install: Node 24 runs the TypeScript exporter directly. The
// output is formatted as JSON.stringify writes it (see content/README.md).
// Exits 1 with the line number when LESSONS.md breaks the format.
//
// Node prints a MODULE_TYPELESS_PACKAGE_JSON warning when it loads the .ts
// file; pass --disable-warning=MODULE_TYPELESS_PACKAGE_JSON to hide it.

import { readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import {
  exportLessons,
  LessonsFormatError
} from '../libs/content/lessons-export.ts'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    source: { type: 'string' }
  }
})

const [input, output] = positionals
const { id, name, description, source } = values
if (!input || !output || !id || !name || !description || !source) {
  console.error(
    'usage: node scripts/export-lessons.mjs <LESSONS.md> <out.json> --id <id> --name <name> --description <text> --source <url>'
  )
  process.exit(2)
}

try {
  const lessons = exportLessons(readFileSync(input, 'utf8'), {
    id,
    name,
    description,
    source
  })
  writeFileSync(output, `${JSON.stringify(lessons, null, 2)}\n`)
  const cards = lessons.sections.reduce((n, s) => n + s.cards.length, 0)
  console.log(`${output}: ${lessons.sections.length} sections, ${cards} cards`)
} catch (error) {
  if (!(error instanceof LessonsFormatError)) throw error
  console.error(error.message)
  process.exit(1)
}
