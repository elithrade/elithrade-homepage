import { Container, Box, Heading } from '@chakra-ui/react'

export default function Page() {
  return (
    <Container>
      <Box borderRadius="lg" bg="red" p={3} mb={6} align="center">
        Hello, I&apos;m a senior software engineer based in Perth, Australia!
      </Box>
      <Box display={{ md: 'flex' }}>
        <Box flexGrow={1}>
          <Heading as="h2" variant="page-title">
            Bin Hu
          </Heading>
          <p>
            Your time is limited, so don&apos;t waste it living someone
            else&apos;s life.
          </p>
        </Box>
      </Box>
    </Container>
  )
}
