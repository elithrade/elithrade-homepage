import NextLink from 'next/link'
import {
  Container,
  Box,
  Heading,
  Link,
  Image,
  useColorModeValue
} from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import Paragraph from '../components/Paragraph'
import { BioSection, BioYear } from '../components/bio'
import { Category, CategorySection } from '../components/category'

const getExperienceYears = () => {
  return new Date().getFullYear() - 2006
}

const Page = () => {
  return (
    <Layout>
      <Container maxW="container.lg">
        <Box
          borderRadius="lg"
          bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
          p={3}
          mb={6}
          align="center"
        >
          Hello, I&apos;m a full stack developer based in Perth, Australia!
        </Box>
        <Box display={{ md: 'flex' }}>
          <Box flexGrow={1}>
            <Heading as="h2" variant="page-title">
              Bin Hu
            </Heading>
            <p>"Be the change that you want to see in the world."</p>
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
            Me
          </Heading>
          <Paragraph>
            I am a Senior Software Engineer with over {getExperienceYears()}{' '}
            years of hands‑on experience across full‑stack development, cloud
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
