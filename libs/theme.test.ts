import { describe, it, expect } from 'vitest'
import theme, { fonts, palette } from './theme'

// WCAG relative luminance and contrast ratio.
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('theme', () => {
  it('starts in dark mode and follows the system colour scheme', () => {
    expect(theme.config.initialColorMode).toBe('dark')
    expect(theme.config.useSystemColorMode).toBe(true)
  })

  it('maps every semantic colour to a light and dark value', () => {
    expect(theme.semanticTokens.colors['chakra-body-bg']).toEqual({
      _light: '#f7f5f2',
      _dark: '#202023'
    })
    expect(theme.semanticTokens.colors['accent-solid']).toEqual({
      _light: palette.light.accentSolid,
      _dark: palette.dark.accentSolid
    })
  })

  it('uses the theme toggle colours as the accent', () => {
    // ThemeToggleButton uses colorScheme purple (light) and orange (dark).
    expect(palette.light.accentSolid).toBe(
      theme.colors.purple[500].toLowerCase()
    )
    expect(palette.dark.accentSolid).toBe(
      theme.colors.orange[200].toLowerCase()
    )
  })

  it.each(['light', 'dark'] as const)(
    'meets WCAG AA contrast in %s mode',
    mode => {
      const p = palette[mode]
      for (const [fg, bg] of [
        [p.text, p.page],
        [p.text, p.surface],
        [p.muted, p.page],
        [p.muted, p.surface],
        [p.accent, p.page],
        [p.onAccent, p.accentSolid],
        [p.tagFg, p.tagBg]
      ]) {
        expect(contrast(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  )

  it('colours links with the accent', () => {
    expect(theme.components.Link.baseStyle).toMatchObject({
      color: 'accent',
      textUnderlineOffset: 3
    })
  })

  it('defines the underlined section-title heading variant', () => {
    expect(theme.components.Heading.variants['section-title']).toMatchObject({
      textDecoration: 'underline',
      textUnderlineOffset: 6,
      textDecorationThickness: 4
    })
  })

  it('uses the self-hosted fonts with system fallbacks', () => {
    expect(theme.fonts.body).toBe(fonts.body)
    expect(fonts.body).toMatch(/^var\(--font-body\), system-ui/)
    expect(fonts.heading).toBe(fonts.body)
    expect(fonts.logo).toMatch(/^var\(--font-logo\)/)
  })
})
