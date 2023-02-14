import { Container, Heading, SimpleGrid } from '@chakra-ui/react'
import Section from '../components/section'
import { WorkGridItem } from '../components/grid-item'
import scooter from '../public/images/works/scooter.png'

const Works = () => {
  return (
    <Container>
      <Heading as="h3" fontSize={20} mb={4}>
        Works
      </Heading>
      <SimpleGrid columns={[1, 1, 2]} gap={6}>
        <Section delay={0.1}>
          <WorkGridItem id="scooter" title="Scooter" thumbnail={scooter}>
            A random scooter
          </WorkGridItem>
        </Section>
        <Section delay={0.2}>
          <WorkGridItem id="scooter2" title="Scooter 2" thumbnail={scooter}>
            A second random scooter
          </WorkGridItem>
        </Section>
      </SimpleGrid>
    </Container>
  )
}

export default Works
