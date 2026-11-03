import type { ReactNode } from 'react'
import type { NextRouter } from 'next/router'
import Head from 'next/head'
import { Box, Container } from '@chakra-ui/react'
import Navbar from '../navbar'
import NoSsr from '../no-ssr'
import MiniArena from '../mini-arena'
import Footer from '../footer'

type MainProps = {
  children?: ReactNode
  router: NextRouter
  showQuoteAttribution?: boolean
}

export default function Main({
  children,
  router,
  showQuoteAttribution
}: MainProps) {
  return (
    <Box>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Bin Hu - Homepage</title>
      </Head>

      <Navbar path={router.asPath} />

      <Container as="main" maxW="container.lg" pt={14}>
        <NoSsr>
          <MiniArena />
        </NoSsr>
        {children}
      </Container>

      <Container maxW="container.lg">
        <Footer showQuoteAttribution={showQuoteAttribution} />
      </Container>
    </Box>
  )
}
