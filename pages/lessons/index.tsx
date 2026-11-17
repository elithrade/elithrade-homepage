import type { InferGetStaticPropsType } from 'next'
import NextLink from 'next/link'
import {
  Container,
  Heading,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Tag,
  Text,
  Wrap,
  WrapItem
} from '@chakra-ui/react'
import Layout from '../../components/layouts/article'
import Section from '../../components/section'
import { lessonProjects } from '../../libs/content/lessons'
import { plural, summaryOf, type ProjectSummary } from '../../libs/lessons'

// Counts only: the cards stay out of this page's data and bundle.
export const getStaticProps = () => ({
  props: { projects: lessonProjects.map(summaryOf) }
})

const ProjectCard = ({ summary }: { summary: ProjectSummary }) => {
  const { project } = summary
  return (
    <LinkBox
      as="article"
      h="100%"
      p={5}
      borderRadius="lg"
      bg="surface"
      borderWidth="1px"
      borderColor="surface-border"
      transition="transform 0.15s ease, border-color 0.15s ease"
      _hover={{ transform: 'translateY(-2px)', borderColor: 'accent' }}
    >
      <Heading as="h4" fontSize={17} fontWeight={600} mb={2}>
        <LinkOverlay as={NextLink} href={`/lessons/${project.id}`}>
          {project.name}
        </LinkOverlay>
      </Heading>
      <Text fontSize={15} lineHeight={1.6} color="text-muted" mb={3}>
        {project.description}
      </Text>
      <Wrap spacing={2}>
        <WrapItem>
          <Tag size="sm" bg="tag-bg" color="tag-fg">
            {plural(summary.sections, 'section')}
          </Tag>
        </WrapItem>
        <WrapItem>
          <Tag size="sm" bg="tag-bg" color="tag-fg">
            {plural(summary.cards, 'card')}
          </Tag>
        </WrapItem>
      </Wrap>
    </LinkBox>
  )
}

type LessonsIndexProps = InferGetStaticPropsType<typeof getStaticProps>

const LessonsIndex = ({ projects }: LessonsIndexProps) => (
  <Layout title="Lessons">
    <Container maxW="container.lg">
      <Heading as="h3" fontSize={20} mb={4}>
        Lessons
      </Heading>
      <Text color="text-muted" mb={6} maxW="container.sm">
        Flashcards from building things. Each card comes from a real bug,
        experiment or review in the project. Read the question, answer it, then
        open the answer.
      </Text>
      <Section delay={0.1}>
        <SimpleGrid columns={[1, 1, 2]} gap={6}>
          {projects.map(summary => (
            <ProjectCard key={summary.project.id} summary={summary} />
          ))}
        </SimpleGrid>
      </Section>
    </Container>
  </Layout>
)

export default LessonsIndex
