import NextLink from 'next/link'
import {
  Heading,
  LinkBox,
  LinkOverlay,
  Tag,
  Text,
  Wrap,
  WrapItem
} from '@chakra-ui/react'
import { noBreakHyphens } from '../libs/content/cv'
import type { Work } from '../libs/works'

type WorkCardProps = {
  work: Work
}

/**
 * The card's text: a project's description, or the first of the CV's bullets
 * for a work at an organisation. The card cuts it off after three lines.
 */
export const leadOf = (work: Work) => work.tagline ?? work.highlights[0]

export const WorkCard = ({ work }: WorkCardProps) => (
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
      <LinkOverlay as={NextLink} href={`/works/${work.id}`}>
        {work.title}
      </LinkOverlay>
    </Heading>
    <Text
      fontSize={15}
      lineHeight={1.6}
      color="text-muted"
      mb={3}
      noOfLines={3}
    >
      {noBreakHyphens(leadOf(work))}
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
          <Tag size="sm" bg="tag-bg" color="tag-fg" fontWeight={500}>
            {tech}
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  )
