import { Container, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import Section from '../../components/section'
import Layout from '../../components/layouts/article'
import { WorkCard } from '../../components/work-card'
import { groups, worksFor } from '../../libs/works'

const Works = () => {
  return (
    <Layout title="Works">
      <Container maxW="container.lg">
        <Heading as="h3" fontSize={20} mb={4}>
          Works
        </Heading>
        {groups.map((group, i) => (
          <Section key={group.name} delay={0.1 * (i + 1)}>
            <Heading as="h4" variant="section-title">
              {group.name}
            </Heading>
            {group.caption && (
              <Text fontSize={14} color="text-muted" mb={4} mt={-2}>
                {group.caption}
              </Text>
            )}
            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {worksFor(group).map(work => (
                <WorkCard key={work.id} work={work} />
              ))}
            </SimpleGrid>
          </Section>
        ))}
      </Container>
    </Layout>
  )
}

export default Works
