import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType
} from 'next'
import NextLink from 'next/link'
import {
  Badge,
  Box,
  Container,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import Layout from '../../components/layouts/article'
import Section from '../../components/section'
import { TechTags } from '../../components/work-card'
import { noBreakHyphens } from '../../libs/content/cv'
import { getWork, works, type Work } from '../../libs/works'

type Params = { id: string }

export const getStaticPaths: GetStaticPaths<Params> = () => ({
  paths: works.map(work => ({ params: { id: work.id } })),
  fallback: false
})

export const getStaticProps: GetStaticProps<{ work: Work }, Params> = ({
  params
}) => {
  const work = params && getWork(params.id)
  return work ? { props: { work } } : { notFound: true }
}

type WorkPageProps = InferGetStaticPropsType<typeof getStaticProps>

const WorkPage = ({ work }: WorkPageProps) => (
  <Layout title={work.title}>
    <Container maxW="container.lg">
      <Link as={NextLink} href="/works" display="inline-flex" mb={4}>
        <ChevronLeftIcon boxSize={6} />
        Works
      </Link>
      <Heading as="h2" fontSize={28} mb={2}>
        {work.title}
      </Heading>
      <Box mb={4}>
        <Badge bg="tag-bg" color="tag-fg" mr={2}>
          {work.group.name}
        </Badge>
        <Text as="span" fontSize={14} color="text-muted">
          {work.period}
        </Text>
      </Box>
      <Section delay={0.1}>
        {work.tagline && <Text mb={2}>{noBreakHyphens(work.tagline)}</Text>}
        {work.url && (
          <Text mb={4}>
            <Link href={work.url} target="_blank">
              {work.url.replace(/^https:\/\//, '')}
            </Link>
          </Text>
        )}
        <Heading as="h3" variant="section-title">
          Highlights
        </Heading>
        <UnorderedList spacing={2} mb={6}>
          {work.highlights.map(highlight => (
            <ListItem key={highlight}>{noBreakHyphens(highlight)}</ListItem>
          ))}
        </UnorderedList>
        {work.stack.length > 0 && (
          <>
            <Heading as="h3" variant="section-title">
              Stack
            </Heading>
            <TechTags stack={work.stack} />
          </>
        )}
      </Section>
    </Container>
  </Layout>
)

export default WorkPage
