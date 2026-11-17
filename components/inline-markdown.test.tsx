import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { InlineMarkdown, plainText } from './inline-markdown'

describe('InlineMarkdown', () => {
  it('renders `code` as code and **bold** as strong, with the text between', () => {
    const { container } = render(
      <p>
        <InlineMarkdown text="Use `SET NX`, **not** a lock." />
      </p>
    )

    expect(container.querySelector('code')).toHaveTextContent('SET NX')
    expect(container.querySelector('strong')).toHaveTextContent('not')
    expect(container).toHaveTextContent('Use SET NX, not a lock.')
  })

  it('keeps asterisks inside code as code', () => {
    const { container } = render(<InlineMarkdown text="`Password=***` here" />)

    expect(container.querySelector('code')).toHaveTextContent('Password=***')
    expect(container.querySelector('strong')).toBeNull()
  })

  it('leaves an unpaired backtick as text', () => {
    const { container } = render(<InlineMarkdown text="a ` b" />)

    expect(container.querySelector('code')).toBeNull()
    expect(container).toHaveTextContent('a ` b')
  })
})

describe('plainText', () => {
  it('drops the markers and keeps the words', () => {
    expect(plainText('Use `SET NX`, **not** `a**b`.')).toBe(
      'Use SET NX, not a**b.'
    )
  })
})
