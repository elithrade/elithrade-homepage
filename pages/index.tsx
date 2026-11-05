import { useSyncExternalStore } from 'react'
import type { InferGetStaticPropsType } from 'next'
import NextLink from 'next/link'
import { Container, Box, Heading, Link, Image, Text } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import Paragraph from '../components/Paragraph'
import { BioSection, BioYear } from '../components/bio'
import { Category, CategorySection } from '../components/category'
import DownloadCvButton from '../components/download-cv-button'
import { fetchQuoteOfTheDay } from '../libs/quote'
import {
  bioEntries,
  careerStartYear,
  cv,
  noBreakHyphens,
  summaryParagraphs,
  yearRange
} from '../libs/content/cv'

const currentYear = () => new Date().getFullYear()
const subscribeToYear = () => () => {}

// This page is prerendered at build time, so its HTML holds the build year.
// Hydrate with that same year (the server snapshot), then React re-renders
// with the visitor's current year. Computing the year during render instead
// causes a hydration mismatch once a new year starts without a rebuild.
const useCurrentYear = (buildYear: number) =>
  useSyncExternalStore(subscribeToYear, currentYear, () => buildYear)

// How often Next may regenerate the page in the background (ISR) to pick up
// ZenQuotes' new quote of the day, which changes at 00:00 UTC. Visitors are
// always served a cached page, and only the first request after the window
// triggers a regeneration, so ZenQuotes is called at most about once an hour.
// After a failed fetch, retry sooner so the fallback doesn't linger.
export const QUOTE_REVALIDATE_SECONDS = 60 * 60
export const FALLBACK_REVALIDATE_SECONDS = 5 * 60

export const getStaticProps = async () => {
  const quote = await fetchQuoteOfTheDay()
  return {
    props: { buildYear: currentYear(), quote },
    revalidate:
      quote.source === 'fallback'
        ? FALLBACK_REVALIDATE_SECONDS
        : QUOTE_REVALIDATE_SECONDS
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const Page = ({ buildYear, quote }: PageProps) => {
  const experienceYears = useCurrentYear(buildYear) - careerStartYear()

  return (
    <Layout>
      <Container maxW="container.lg">
        <Box
          borderRadius="lg"
          bg="surface"
          borderWidth="1px"
          borderColor="surface-border"
          p={3}
          mb={6}
          align="center"
        >
          Hello, I&apos;m a full stack developer based in Perth, Australia!
        </Box>
        {/* One header band: the photo sits right beside the name so the two
            read as one, and the quote of the day fills the space to their right.
            On phones there's no room for three columns, so the quote drops
            below. A divider and muted text keep it reading as a quote, not as a
            tagline. Its length changes daily, so its width is capped and it is
            centred against the photo. */}
        <Box
          display={{ md: 'flex' }}
          alignItems="center"
          gap={8}
          mb={{ base: 8, md: 10 }}
        >
          <Box display="flex" alignItems="center" gap={{ base: 4, md: 6 }}>
            <Image
              flexShrink={0}
              boxSize={{ base: '96px', md: '120px' }}
              objectFit="cover"
              borderColor="whiteAlpha.800"
              borderWidth={2}
              borderStyle="solid"
              borderRadius="full"
              src="/images/profile.jpg"
              alt="Profile image"
            />
            <Box flexShrink={0}>
              <Heading as="h2">Bin Hu</Heading>
              <DownloadCvButton mt={2} />
            </Box>
          </Box>
          <Box
            as="figure"
            // Shrinks to the quote, so the right-aligned author sits under the
            // end of it rather than at the far edge on a phone.
            w="fit-content"
            maxW="36rem"
            ml={{ md: 'auto' }}
            mt={{ base: 6, md: 0 }}
            pl={4}
            borderLeftWidth="2px"
            borderColor="surface-border"
          >
            <Text as="blockquote" fontStyle="italic" color="text-muted">
              &ldquo;{quote.text}&rdquo;
            </Text>
            <Text
              as="figcaption"
              fontSize="sm"
              color="text-muted"
              mt={1}
              textAlign="right"
            >
              {/* The ZenQuotes attribution is in the footer. */}
              &mdash; {quote.author}
            </Text>
          </Box>
        </Box>
        <Section delay={0.1}>
          <Heading as="h3" variant="section-title">
            Me
          </Heading>
          {summaryParagraphs(experienceYears).map(paragraph => (
            <Paragraph key={paragraph}>{noBreakHyphens(paragraph)}</Paragraph>
          ))}
        </Section>
        <Section delay={0.2}>
          <Heading as="h3" variant="section-title">
            Bio
          </Heading>
          {bioEntries().map(entry => (
            <BioSection key={entry.key}>
              <BioYear>{yearRange(entry)}</BioYear>
              {noBreakHyphens(entry.headline)} at&nbsp;
              <Link
                as={NextLink}
                href={entry.organisation.url}
                passHref
                target="_blank"
              >
                {entry.organisation.name}
              </Link>
            </BioSection>
          ))}
        </Section>
        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            Technical Skills
          </Heading>
          {cv.skills.map(skill => (
            <CategorySection key={skill.category}>
              <Category>{noBreakHyphens(skill.category)}</Category>
              {noBreakHyphens(skill.items.join(', '))}
            </CategorySection>
          ))}
        </Section>
      </Container>
    </Layout>
  )
}

export default Page
