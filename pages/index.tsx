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

const CAREER_START_YEAR = 2006

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
  const experienceYears = useCurrentYear(buildYear) - CAREER_START_YEAR

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
        <Box display={{ md: 'flex' }}>
          <Box flexGrow={1}>
            <Heading as="h2">Bin Hu</Heading>
            <DownloadCvButton mt={2} />
          </Box>
          <Box
            flexShrink={0}
            mt={{ base: 4, md: 0 }}
            ml={{ md: 6 }}
            align="center"
          >
            <Image
              borderColor="whiteAlpha.800"
              borderWidth={2}
              borderStyle="solid"
              maxWidth="100px"
              display="inline-block"
              borderRadius="full"
              src="/images/profile.jpg"
              alt="Profile image"
            />
          </Box>
        </Box>
        {/* The quote of the day, set apart as an epigraph. Its width is capped
            because long centred lines are hard to read. */}
        <Box as="figure" textAlign="center" maxW="36rem" mx="auto" mt={6}>
          <Text
            as="blockquote"
            fontStyle="italic"
            fontSize={{ base: 'md', md: 'lg' }}
          >
            &ldquo;{quote.text}&rdquo;
          </Text>
          <Text as="figcaption" fontSize="sm" color="text-muted" mt={1}>
            &mdash; {quote.author}
            {quote.source === 'zenquotes' && (
              <Text as="span" fontSize="xs">
                {' · via '}
                {/* ZenQuotes' free tier requires this attribution link. */}
                <Link href="https://zenquotes.io/" isExternal>
                  ZenQuotes
                </Link>
              </Text>
            )}
          </Text>
        </Box>
        <Section delay={0.1}>
          <Heading as="h3" variant="section-title">
            Me
          </Heading>
          <Paragraph>
            I am a Senior Software Engineer with over {experienceYears} years of
            hands‑on experience across full‑stack development, cloud
            infrastructure, and system integration. I specialize in building
            robust, scalable applications and automating deployment pipelines
            using modern DevOps tools and practices. A long‑time Vim enthusiast,
            I enjoy working in terminal‑based environments and continuously
            refine my toolchain to boost efficiency and focus.
          </Paragraph>
          <Paragraph>
            I’m passionate about solving complex technical challenges and
            constantly exploring new technologies and development techniques.
            While my primary focus remains software engineering, I’m
            increasingly contributing to architectural discussions and system
            design, aiming to grow into broader technical leadership over time
          </Paragraph>
        </Section>
        <Section delay={0.2}>
          <Heading as="h3" variant="section-title">
            Bio
          </Heading>
          <BioSection>
            <BioYear>2002 - 2006</BioYear>
            Completed Bachelor of Engineering degree in Software Engineering
            with Honours at&nbsp;
            <Link
              as={NextLink}
              href="https://unsw.edu.au"
              passHref
              target="_blank"
            >
              The University of New South Wales.
            </Link>
          </BioSection>
          <BioSection>
            <BioYear>2006 - 2022</BioYear>
            Senior Innovation Engineer at&nbsp;
            <Link
              as={NextLink}
              href="https://www.fugro.com"
              passHref
              target="_blank"
            >
              Fugro
            </Link>
          </BioSection>
          <BioSection>
            <BioYear>2022 - present</BioYear>
            Senior Software Engineer at&nbsp;
            <Link
              as={NextLink}
              href="https://rac.com.au"
              passHref
              target="_blank"
            >
              RACWA
            </Link>
          </BioSection>
        </Section>
        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            Technical Skills
          </Heading>
          <CategorySection>
            <Category>Backend</Category>
            GraphQL, Express, REST API, Serverless, EntityFramework, SQL,
            Non‑SQL (DynamoDB)
          </CategorySection>
          <CategorySection>
            <Category>Frontend</Category>
            Next.js, React, Material UI, CSS
          </CategorySection>
          <CategorySection>
            <Category>DevOps</Category>
            GitHub Actions, AWS CDK, Docker, Terraform, Jenkins
          </CategorySection>
          <CategorySection>
            <Category>Programming Languages</Category>
            C#, TypeScript, Python, Go, Rust, C, Julia
          </CategorySection>
          <CategorySection>
            <Category>Cloud - Azure</Category>
            App Service, Container Apps, Functions, App Gateway, App Insights,
            APIM, AD (Entra ID)
          </CategorySection>
          <CategorySection>
            <Category>Cloud - AWS</Category>
            EC2, S3, RDS, Lambda, API Gateway, CloudFront, Elemental, DynamoDB,
            ECR, ECS, Fargate
          </CategorySection>
          <CategorySection>
            <Category>Tools</Category>
            Git, Neovim/Vim, Visual Studio, VSCode, Unity Editor
          </CategorySection>
          <CategorySection>
            <Category>Methodology</Category>
            Agile, Object‑Oriented/Functional Programming, CI/CD, Unit testing
            for all languages
          </CategorySection>
          <CategorySection>
            <Category>Languages</Category>
            English, Mandarin
          </CategorySection>
        </Section>
      </Container>
    </Layout>
  )
}

export default Page
