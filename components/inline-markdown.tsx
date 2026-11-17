import { Code } from '@chakra-ui/react'
import type { InlineMarkdown as Markdown } from '../libs/content/lessons'

// The lesson cards use only `code` and **bold** (the exporter rejects other
// Markdown), so this renders those two and leaves everything else as text.
// A code span is matched first, so asterisks inside it stay code.
const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*)/

type Token = { kind: 'text' | 'code' | 'bold'; text: string }

// split() with a capturing group puts the matched tokens at the odd indexes.
const tokens = (text: Markdown): Token[] =>
  text
    .split(TOKEN)
    .map((part, i): Token => {
      if (i % 2 === 0) return { kind: 'text', text: part }
      return part.startsWith('`')
        ? { kind: 'code', text: part.slice(1, -1) }
        : { kind: 'bold', text: part.slice(2, -2) }
    })
    .filter(t => t.text !== '')

/** The text without the Markdown markers, as it reads on the page. */
export const plainText = (text: Markdown) =>
  tokens(text)
    .map(t => t.text)
    .join('')

export const InlineMarkdown = ({ text }: { text: Markdown }) => (
  <>
    {tokens(text).map((t, i) =>
      t.kind === 'code' ? (
        <Code
          key={i}
          display="inline"
          fontSize="0.88em"
          px={1}
          borderRadius="sm"
          bg="tag-bg"
          color="tag-fg"
          whiteSpace="normal"
          wordBreak="break-word"
        >
          {t.text}
        </Code>
      ) : t.kind === 'bold' ? (
        <strong key={i}>{t.text}</strong>
      ) : (
        t.text
      )
    )}
  </>
)
