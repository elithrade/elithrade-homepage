import { Box, Link, Text } from '@chakra-ui/react'

export const LINKEDIN_URL = 'https://www.linkedin.com/in/bin-hu-ab9035195'
export const SOURCE_URL = 'https://github.com/elithrade/elithrade-homepage'
export const TEMPLATE_URL = 'https://www.craftz.dog/'
export const ZENQUOTES_URL = 'https://zenquotes.io/'

type FooterProps = {
  // True on a page showing a ZenQuotes quote: their free tier requires an
  // attribution link wherever the quotes are used.
  showQuoteAttribution?: boolean
}

const Separator = () => <span aria-hidden="true"> · </span>

const Footer = ({ showQuoteAttribution = false }: FooterProps) => (
  <Box
    as="footer"
    textAlign="center"
    color="text-muted"
    fontSize="sm"
    pt={8}
    pb={6}
  >
    <Text>
      {/* The year is rendered on the server at build time; after New Year
          the visitor's clock may differ until the next regeneration. */}
      <span suppressHydrationWarning>
        &copy; {new Date().getFullYear()} Bin Hu
      </span>
      <Separator />
      <Link href={LINKEDIN_URL} isExternal>
        LinkedIn
      </Link>
      <Separator />
      <Link href={SOURCE_URL} isExternal>
        Source on GitHub
      </Link>
    </Text>
    <Text fontSize="xs" mt={1}>
      {/* The craftzdog-homepage template's license asks for this link. */}
      Based on{' '}
      <Link href={TEMPLATE_URL} isExternal>
        craftz.dog
      </Link>
      {showQuoteAttribution && (
        <>
          <Separator />
          Quote via{' '}
          <Link href={ZENQUOTES_URL} isExternal>
            ZenQuotes
          </Link>
        </>
      )}
    </Text>
  </Box>
)

export default Footer
