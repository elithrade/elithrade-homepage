import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { MotionGlobalConfig } from 'framer-motion'

// Run framer-motion animations instantly so tests don't wait on them.
MotionGlobalConfig.skipAnimations = true

// jsdom has no matchMedia; Chakra uses it for `useSystemColorMode`.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    }
  })
}

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.colorScheme = ''
  document.body.className = ''
})
