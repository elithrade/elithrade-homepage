import NextLink from 'next/link'
import {
  Heading,
  LinkBox,
  LinkOverlay,
  Tag,
  Text,
  Wrap,
  WrapItem,
  useColorModeValue
} from '@chakra-ui/react'
import type { Work } from '../libs/works'

type WorkCardProps = {
  work: Work
}

export const WorkCard = ({ work }: WorkCardProps) => (
  <LinkBox
    as="article"
    h="100%"
    p={4}
    borderRadius="lg"
    bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
    transition="transform 0.15s ease"
    _hover={{ transform: 'translateY(-2px)' }}
  >
    <Heading as="h4" fontSize={18} mb={2}>
      <LinkOverlay as={NextLink} href={`/works/${work.id}`}>
        {work.title}
      </LinkOverlay>
    </Heading>
    <Text fontSize={14} mb={3}>
      {work.summary}
    </Text>
    <TechTags stack={work.stack} />
  </LinkBox>
)

type TechTagsProps = {
  stack: string[]
}

export const TechTags = ({ stack }: TechTagsProps) =>
  stack.length === 0 ? null : (
    <Wrap spacing={2} aria-label="Technologies">
      {stack.map(tech => (
        <WrapItem key={tech}>
          <Tag size="sm" colorScheme="teal">
            {tech}
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  )
