import localFont from 'next/font/local'

// Hack (https://sourcefoundry.org/hack/, v3.3.0 from the hack-font npm
// package) is used for all text. The files live in assets/fonts/hack with its
// licence. next/font hashes them, serves them from the site and preloads them,
// so text never renders in a fallback font first. These are the full files:
// the published subsets lack arrows, π and maths symbols used in the lessons.
// Hack has no 500/600 weights, so those render as regular and bold. Bold
// italic is left out because nothing uses it.
const hack = localFont({
  src: [
    { path: '../assets/fonts/hack/hack-regular.woff2', weight: '400' },
    { path: '../assets/fonts/hack/hack-bold.woff2', weight: '700' },
    {
      path: '../assets/fonts/hack/hack-italic.woff2',
      weight: '400',
      style: 'italic'
    }
  ],
  display: 'swap',
  // The default fallback is Arial resized to Hack's metrics, which would
  // swap a proportional font for a monospace one. The theme's monospace
  // stack (libs/theme.ts) is the fallback instead.
  adjustFontFallback: false
})

// The theme refers to this variable (see libs/theme.ts).
const Fonts = () => (
  <style jsx global>{`
    :root {
      --font-body: ${hack.style.fontFamily};
    }
  `}</style>
)

export default Fonts
