import { Container, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import Section from '../../components/section'
import Layout from '../../components/layouts/article'
import { WorkCard } from '../../components/work-card'
import { organisations, worksFor } from '../../libs/works'

const Works = () => {
  return (
    <Layout title="Works">
      <Container maxW="container.lg">
        <Heading as="h3" fontSize={20} mb={4}>
          Works
        </Heading>
        {organisations.map((organisation, i) => (
          <Section key={organisation.name} delay={0.1 * (i + 1)}>
            <Heading as="h4" variant="section-title">
              {organisation.name}
            </Heading>
            <Text fontSize={14} mb={4} mt={-2}>
              {organisation.role} · {organisation.period}
            </Text>
            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {worksFor(organisation).map(work => (
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
