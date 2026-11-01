import { Inter, M_PLUS_Rounded_1c } from 'next/font/google'

// next/font downloads the fonts at build time and serves them from the site,
// preloaded, so text never renders in a fallback font first. Inter is used
// for all text; the rounded font only for the "Bin Hu" wordmark.
const inter = Inter({ subsets: ['latin'], display: 'swap' })
const rounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: '700',
  display: 'swap'
})

// The theme refers to these variables (see libs/theme.ts).
const Fonts = () => (
  <style jsx global>{`
    :root {
      --font-body: ${inter.style.fontFamily};
      --font-logo: ${rounded.style.fontFamily};
    }
  `}</style>
)

export default Fonts
