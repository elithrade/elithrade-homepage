import { ChakraProvider } from '@chakra-ui/react'
import Layout from '../components/layouts/main'

export default function Website({ Component, pageProps, router }) {
  return (
    <ChakraProvider>
      <Layout router={router}>
        <Component {...pageProps} key={router.route} />
      </Layout>
    </ChakraProvider>
  )
}
