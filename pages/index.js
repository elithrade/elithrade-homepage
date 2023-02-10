import NextLink from 'next/link'
import {
  Container,
  Box,
  Heading,
  Link,
  Image,
  useColorModeValue
} from '@chakra-ui/react'
import Section from '../components/section'
import Paragraph from '../components/Paragraph'
import { BioSection, BioYear } from '../components/bio'

const getExperienceYears = () => {
  return new Date().getFullYear() - 2006
}

const Page = () => {
  return (
    <Container>
      <Box
        borderRadius="lg"
        bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
        p={3}
        mb={6}
        align="center"
      >
        Hello, I&apos;m a senior software engineer based in Perth, Australia!
      </Box>
      <Box display={{ md: 'flex' }}>
        <Box flexGrow={1}>
          <Heading as="h2" variant="page-title">
            Bin Hu
          </Heading>
          <p>
            Your time is limited, so don&apos;t waste it living someone
            else&apos;s life.
          </p>
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
      <Section delay={0.1}>
        <Heading as="h3" variant="section-title">
          Work
        </Heading>
        <Paragraph>
          Bin is currently a Senior Software Engineer at&nbsp;
          <Link
            as={NextLink}
            href="https://rac.com.au"
            passHref
            target="_blank"
          >
            RACWA
          </Link>
          ,&nbsp;with {getExperienceYears()} years experience in developing
          innovative solutions. Loves Vim, Linux, AWS, .NET Core and open source
          software. Enjoys to customize all of the development environment.
          Interested in devising a simple yet efficient method for challenging
          tasks, and learning new technologies and tools constantly.
        </Paragraph>
      </Section>
      <Section delay={0.2}>
        <Heading as="h3" variant="section-title">
          Bio
        </Heading>
        <BioSection>
          <BioYear>2002 - 2006</BioYear>
          Completed Bachelor of Engineering degree in Software Engineering with
          Honours at The University of New South Wales.
        </BioSection>
        <BioSection>
          <BioYear>2006 - 2022</BioYear>
          Senior Innovation Engineer at Fugro Marine Australia.
        </BioSection>
        <BioSection>
          <BioYear>2022 - present</BioYear>
          Senior Software Engineer at RACWA.
        </BioSection>
      </Section>
    </Container>
  )
}

export default Page
