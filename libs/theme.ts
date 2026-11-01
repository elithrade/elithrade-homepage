import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// Each mode's accent matches the theme toggle button: purple in light mode,
// amber (orange.200) in dark. Large surfaces stay neutral, and every
// text/background pair meets WCAG AA contrast (4.5:1).
export const palette = {
  light: {
    page: '#f7f5f2',
    surface: '#ffffff',
    border: '#e8e4dd',
    text: '#24221f',
    muted: '#5c5852',
    accent: '#6b46c1', // purple.600: purple.500 is too light for text
    accentSolid: '#805ad5', // purple.500, the toggle's colour
    onAccent: '#ffffff',
    tagBg: '#f1ebfc',
    tagFg: '#553c9a',
    rule: '#d6bcfa'
  },
  dark: {
    page: '#202023',
    surface: '#2a2a2e',
    border: '#38383d',
    text: '#e6e4e0', // softer than pure white to reduce glare
    muted: '#a8a6a1',
    accent: '#fbd38d', // orange.200, the toggle's colour
    accentSolid: '#fbd38d',
    onAccent: '#202023',
    tagBg: '#3a352d',
    tagFg: '#fbd38d',
    rule: '#6e5c3e'
  }
} as const

type PaletteKey = keyof typeof palette.light

const token = (key: PaletteKey) => ({
  _light: palette.light[key],
  _dark: palette.dark[key]
})

const semanticTokens = {
  colors: {
    // Chakra's own body tokens, used by its global body styles.
    'chakra-body-bg': token('page'),
    'chakra-body-text': token('text'),
    surface: token('surface'),
    'surface-border': token('border'),
    'text-muted': token('muted'),
    accent: token('accent'),
    'accent-solid': token('accentSolid'),
    'on-accent': token('onAccent'),
    'tag-bg': token('tagBg'),
    'tag-fg': token('tagFg'),
    rule: token('rule')
  }
}

// --font-body and --font-logo are set by components/fonts.tsx, which loads
// the fonts with next/font. The fallbacks cover the moment before they load.
const fallback = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

export const fonts = {
  body: `var(--font-body), ${fallback}`,
  heading: `var(--font-body), ${fallback}`,
  logo: `var(--font-logo), var(--font-body), ${fallback}`
}

const components = {
  Heading: {
    variants: {
      'section-title': {
        textDecoration: 'underline',
        fontSize: 20,
        textUnderlineOffset: 6,
        textDecorationColor: 'rule',
        textDecorationThickness: 4,
        marginTop: 3,
        marginBottom: 4
      }
    }
  },
  Link: {
    baseStyle: {
      color: 'accent',
      textUnderlineOffset: 3
    }
  }
}

const config: ThemeConfig = {
  // The initial mode you'd like your app to start with when
  // user visit the page for first time (or after storage reset).
  // Can be one of dark, light or system. Default is light.
  // This value is persisted in browser localstorage.
  initialColorMode: 'dark',
  // If true, Chakra UI subscribes to changes in system color mode.
  // If set to false, the app's color mode is detached
  // from the system color mode. Default is false.
  useSystemColorMode: true
}

const theme = extendTheme({ config, semanticTokens, components, fonts })

export default theme
