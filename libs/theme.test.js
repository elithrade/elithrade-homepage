import { describe, it, expect } from 'vitest'
import theme from './theme'

const light = { colorMode: 'light', theme }
const dark = { colorMode: 'dark', theme }

describe('theme', () => {
  it('starts in dark mode and follows the system colour scheme', () => {
    expect(theme.config.initialColorMode).toBe('dark')
    expect(theme.config.useSystemColorMode).toBe(true)
  })

  it('uses a cream body background in light mode and charcoal in dark', () => {
    expect(theme.styles.global(light).body.bg).toBe('#f0e7db')
    expect(theme.styles.global(dark).body.bg).toBe('#202023')
  })

  it('colours links blue in light mode and pink in dark', () => {
    const { baseStyle } = theme.components.Link
    expect(baseStyle(light)).toMatchObject({
      color: '#3d7aed',
      textUnderlineOffset: 3
    })
    expect(baseStyle(dark).color).toBe('#ff63c3')
  })

  it('defines the underlined section-title heading variant', () => {
    expect(theme.components.Heading.variants['section-title']).toMatchObject({
      textDecoration: 'underline',
      textUnderlineOffset: 6,
      textDecorationThickness: 4
    })
  })

  it('registers custom fonts and colours', () => {
    expect(theme.fonts.heading).toBe("'M PLUS Rounded 1c'")
    expect(theme.colors.grassTeal).toBe('#88ccca')
  })
})
