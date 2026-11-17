import { useState } from 'react'
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType
} from 'next'
import NextLink from 'next/link'
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  List,
  ListItem,
  Text,
  Wrap
} from '@chakra-ui/react'
import Layout from '../../../components/layouts/article'
import { Breadcrumbs } from '../../../components/breadcrumbs'
import Section from '../../../components/section'
import { InlineMarkdown } from '../../../components/inline-markdown'
import {
  PrimaryButton,
  SecondaryButton
} from '../../../components/lesson-buttons'
import { Practice } from '../../../components/practice'
import { lessonProjects } from '../../../libs/content/lessons'
import { loadLessons } from '../../../libs/content/lessons-loaders'
import {
  cardCount,
  cardsInSections,
  contentsOf,
  MIN_QUERY_LENGTH,
  plural,
  searchQuestions,
  sectionHref,
  type CardInSection,
  type Contents
} from '../../../libs/lessons'
import { useMissedCards } from '../../../libs/missed-cards'

type Params = { project: string }

export const getStaticPaths: GetStaticPaths<Params> = () => ({
  paths: lessonProjects.map(l => ({ params: { project: l.project.id } })),
  fallback: false
})

// The questions only. Practice loads the answers when it starts, so this
// page's data stays small as the cards grow.
export const getStaticProps: GetStaticProps<{ contents: Contents }, Params> = ({
  params
}) => {
  const lessons = lessonProjects.find(l => l.project.id === params?.project)
  return lessons
    ? { props: { contents: contentsOf(lessons) } }
    : { notFound: true }
}

type ProjectPageProps = InferGetStaticPropsType<typeof getStaticProps>

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 3,
  minH: '48px',
  px: 3,
  py: 2,
  borderTopWidth: '1px',
  borderColor: 'surface-border',
  color: 'inherit',
  _hover: { bg: 'surface', textDecoration: 'none' }
} as const

type Round = { title: string; cards: CardInSection[] }

const ProjectPage = ({ contents }: ProjectPageProps) => {
  const { project, sections } = contents
  const { missed, record } = useMissedCards(project.id)
  const [query, setQuery] = useState('')
  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  const missedCount = sections
    .flatMap(s => s.cards)
    .filter(c => missed.has(c.id)).length
  const searching = query.trim().length >= MIN_QUERY_LENGTH
  const results = searchQuestions(contents, query)

  const start = async (
    title: string,
    pick: (cards: CardInSection[]) => CardInSection[]
  ) => {
    setLoading(true)
    setLoadFailed(false)
    try {
      const lessons = await loadLessons[project.id]()
      setRound({ title, cards: pick(cardsInSections(lessons)) })
    } catch {
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }

  if (round) {
    return (
      <Layout title={`Practice: ${project.name}`}>
        <Container maxW="container.md">
          <Practice
            title={round.title}
            cards={round.cards}
            onResult={record}
            onExit={() => setRound(null)}
            exitLabel="Back to contents"
          />
        </Container>
      </Layout>
    )
  }

  return (
    <Layout title={`Lessons: ${project.name}`}>
      <Container maxW="container.md">
        <Breadcrumbs labels={{ [`/lessons/${project.id}`]: project.name }} />
        <Heading as="h2" fontSize={28} mb={1}>
          {project.name}
        </Heading>
        <Text fontSize={15} color="text-muted" mb={5}>
          {plural(sections.length, 'section')} ·{' '}
          {plural(cardCount(contents), 'card')} · from{' '}
          <Link href={project.source} isExternal>
            LESSONS.md
          </Link>
        </Text>
        <Wrap spacing={2} mb={loadFailed ? 2 : 6}>
          <PrimaryButton
            isDisabled={loading}
            onClick={() => start(project.name, cards => cards)}
          >
            Practice all
          </PrimaryButton>
          {missedCount > 0 && (
            <SecondaryButton
              isDisabled={loading}
              onClick={() =>
                start('Missed cards', cards =>
                  cards.filter(c => missed.has(c.card.id))
                )
              }
            >
              Practice missed ({missedCount})
            </SecondaryButton>
          )}
        </Wrap>
        {loadFailed && (
          <Text role="alert" fontSize={14} mb={6}>
            The cards didn&apos;t load. Check your connection and try again.
          </Text>
        )}

        <FormControl mb={6}>
          <FormLabel fontSize={14}>Search questions</FormLabel>
          <Input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. backlog, decorator, p99"
            bg="surface"
          />
        </FormControl>

        {searching ? (
          <Box>
            <Text aria-live="polite" fontSize={14} color="text-muted" mb={2}>
              {results.length === 0
                ? 'No questions match.'
                : `${plural(results.length, 'question')} ${results.length === 1 ? 'matches' : 'match'}.`}
            </Text>
            <List
              aria-label="Search results"
              borderBottomWidth="1px"
              borderColor="surface-border"
            >
              {results.map(({ card, section }) => (
                <ListItem key={card.id}>
                  <Link
                    as={NextLink}
                    href={`${sectionHref(project.id, section.id)}#${card.id}`}
                    {...rowStyle}
                    flexDirection="column"
                    alignItems="flex-start"
                    gap={0}
                  >
                    <Text as="span" fontSize={15}>
                      <InlineMarkdown text={card.question} />
                    </Text>
                    <Text as="span" fontSize={13} color="text-muted">
                      {section.n}. <InlineMarkdown text={section.title} />
                    </Text>
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Section delay={0.1}>
            <Box as="nav" aria-label="Sections">
              <List borderBottomWidth="1px" borderColor="surface-border">
                {sections.map(section => (
                  <ListItem key={section.id}>
                    <Link
                      as={NextLink}
                      href={sectionHref(project.id, section.id)}
                      fontSize={15}
                      {...rowStyle}
                    >
                      <Text as="span" w={6} flex="none" color="text-muted">
                        {section.n}
                      </Text>
                      <Text as="span" flex={1} minW={0}>
                        <InlineMarkdown text={section.title} />
                      </Text>
                      <Text
                        as="span"
                        flex="none"
                        fontSize={13}
                        color="text-muted"
                      >
                        {plural(section.cards.length, 'card')}
                      </Text>
                    </Link>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Section>
        )}
      </Container>
    </Layout>
  )
}

export default ProjectPage
