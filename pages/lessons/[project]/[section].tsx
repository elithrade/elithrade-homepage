import { useState, useSyncExternalStore } from 'react'
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType
} from 'next'
import NextLink from 'next/link'
import {
  Box,
  Container,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Wrap
} from '@chakra-ui/react'
import Layout from '../../../components/layouts/article'
import { Breadcrumbs } from '../../../components/breadcrumbs'
import { InlineMarkdown, plainText } from '../../../components/inline-markdown'
import { LessonCard } from '../../../components/lesson-card'
import {
  PrimaryButton,
  SecondaryButton
} from '../../../components/lesson-buttons'
import { Practice } from '../../../components/practice'
import { lessonProjects } from '../../../libs/content/lessons'
import {
  sectionHref,
  sectionPage,
  type SectionLink,
  type SectionPage as Page
} from '../../../libs/lessons'
import { useMissedCards } from '../../../libs/missed-cards'

type Params = { project: string; section: string }

export const getStaticPaths: GetStaticPaths<Params> = () => ({
  paths: lessonProjects.flatMap(l =>
    l.sections.map(s => ({
      params: { project: l.project.id, section: s.id }
    }))
  ),
  fallback: false
})

export const getStaticProps: GetStaticProps<{ page: Page }, Params> = ({
  params
}) => {
  const lessons = lessonProjects.find(l => l.project.id === params?.project)
  const page = lessons && params && sectionPage(lessons, params.section)
  return page ? { props: { page } } : { notFound: true }
}

// The card named in the address (#card-id, as search links to it) starts
// open. Read through useSyncExternalStore so the server's HTML, with every
// card closed, matches the first client render.
const subscribeHash = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}
const useHash = () =>
  useSyncExternalStore(
    subscribeHash,
    () => window.location.hash.slice(1),
    () => ''
  )

const SiblingLink = ({
  projectId,
  section,
  label,
  align
}: {
  projectId: string
  section: SectionLink
  label: string
  align: 'left' | 'right'
}) => (
  <Link
    as={NextLink}
    href={sectionHref(projectId, section.id)}
    display="flex"
    flexDirection="column"
    alignItems={align === 'left' ? 'flex-start' : 'flex-end'}
    textAlign={align}
    gridColumn={align === 'right' ? -2 : undefined}
    px={4}
    py={3}
    borderRadius="lg"
    borderWidth="1px"
    borderColor="surface-border"
    bg="surface"
    color="inherit"
    _hover={{ borderColor: 'accent', textDecoration: 'none' }}
  >
    <Text as="span" fontSize={13} color="text-muted">
      {label}
    </Text>
    <Text as="span" fontSize={15} fontWeight={500}>
      {section.n}. <InlineMarkdown text={section.title} />
    </Text>
  </Link>
)

type SectionPageProps = InferGetStaticPropsType<typeof getStaticProps>

const SectionPage = ({ page }: SectionPageProps) => {
  const { project, section, total, prev, next } = page
  const { missed, record } = useMissedCards(project.id)
  const hash = useHash()
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [practising, setPractising] = useState(false)

  const isOpen = (id: string) => open[id] ?? id === hash
  const allOpen = section.cards.every(c => isOpen(c.id))
  const setAll = (value: boolean) =>
    setOpen(Object.fromEntries(section.cards.map(c => [c.id, value])))

  if (practising) {
    return (
      <Layout title={`Practice: ${plainText(section.title)}`}>
        <Container maxW="container.md">
          <Practice
            title={section.title}
            cards={section.cards.map(card => ({ card, section }))}
            onResult={record}
            onExit={() => setPractising(false)}
            exitLabel="Back to the section"
          />
        </Container>
      </Layout>
    )
  }

  return (
    <Layout title={plainText(section.title)}>
      <Container maxW="container.md">
        <Breadcrumbs
          labels={{
            [`/lessons/${project.id}`]: project.name,
            [sectionHref(project.id, section.id)]: (
              <InlineMarkdown text={section.title} />
            )
          }}
        />
        <Text fontSize={14} color="text-muted" mb={1}>
          Section {section.n} of {total}
        </Text>
        <Heading as="h2" fontSize={28} lineHeight={1.25} mb={4}>
          <InlineMarkdown text={section.title} />
        </Heading>
        {section.intro.map((paragraph, i) => (
          <Text key={i} color="text-muted" mb={4}>
            <InlineMarkdown text={paragraph} />
          </Text>
        ))}
        <Wrap spacing={2} mb={5}>
          <PrimaryButton onClick={() => setPractising(true)}>
            Practice these {section.cards.length}
          </PrimaryButton>
          <SecondaryButton onClick={() => setAll(!allOpen)}>
            {allOpen ? 'Hide all answers' : 'Show all answers'}
          </SecondaryButton>
        </Wrap>
        <Stack spacing={3}>
          {section.cards.map(card => (
            <LessonCard
              key={card.id}
              card={card}
              isOpen={isOpen(card.id)}
              onToggle={() =>
                setOpen(o => ({ ...o, [card.id]: !isOpen(card.id) }))
              }
              wasMissed={missed.has(card.id)}
            />
          ))}
        </Stack>
        <Box as="nav" aria-label="Other sections" mt={8}>
          <SimpleGrid minChildWidth="240px" spacing={3}>
            {prev && (
              <SiblingLink
                projectId={project.id}
                section={prev}
                label="← Previous"
                align="left"
              />
            )}
            {next && (
              <SiblingLink
                projectId={project.id}
                section={next}
                label="Next →"
                align="right"
              />
            )}
          </SimpleGrid>
        </Box>
      </Container>
    </Layout>
  )
}

export default SectionPage
