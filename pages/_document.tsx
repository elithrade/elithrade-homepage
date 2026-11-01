import { ColorModeScript } from '@chakra-ui/react'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import theme from '../libs/theme'

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* The footprint logo, in the variant that contrasts with the
              browser's light or dark tab bar. */}
          <link
            rel="icon"
            type="image/png"
            href="/images/footprint.png"
            media="(prefers-color-scheme: light)"
          />
          <link
            rel="icon"
            type="image/png"
            href="/images/footprint-dark.png"
            media="(prefers-color-scheme: dark)"
          />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
