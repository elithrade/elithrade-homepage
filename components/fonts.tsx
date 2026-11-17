import { M_PLUS_Rounded_1c, Overpass } from 'next/font/google'

// next/font downloads the fonts at build time and serves them from the site,
// preloaded, so text never renders in a fallback font first. Overpass is used
// for all text (with its italic, for the quote); the rounded font only for the
// "Bin Hu" wordmark.
const overpass = Overpass({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap'
})
const rounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: '700',
  display: 'swap'
})

// The theme refers to these variables (see libs/theme.ts).
const Fonts = () => (
  <style jsx global>{`
    :root {
      --font-body: ${overpass.style.fontFamily};
      --font-logo: ${rounded.style.fontFamily};
    }
  `}</style>
)

export default Fonts
