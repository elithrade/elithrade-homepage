import { Box, Tag, Text } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { InlineMarkdown } from './inline-markdown'
import type { LessonCard as Card } from '../libs/content/lessons'

type LessonCardProps = {
  card: Card
  isOpen: boolean
  onToggle: () => void
  /** Missed in an earlier practice round. */
  wasMissed: boolean
}

/** A question that opens to show its answer. Its id is the card's anchor. */
export const LessonCard = ({
  card,
  isOpen,
  onToggle,
  wasMissed
}: LessonCardProps) => {
  const answerId = `${card.id}-answer`
  return (
    <Box
      as="article"
      id={card.id}
      scrollMarginTop={20}
      borderRadius="lg"
      bg="surface"
      borderWidth="1px"
      borderColor="surface-border"
    >
      <Box
        as="button"
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
        display="flex"
        alignItems="flex-start"
        gap={3}
        w="100%"
        p={4}
        textAlign="left"
        fontWeight={500}
        lineHeight={1.5}
        borderRadius="lg"
      >
        {isOpen ? (
          <ChevronDownIcon aria-hidden boxSize={5} mt="2px" color="accent" />
        ) : (
          <ChevronRightIcon
            aria-hidden
            boxSize={5}
            mt="2px"
            color="text-muted"
          />
        )}
        <Box as="span" flex={1} minW={0}>
          <InlineMarkdown text={card.question} />
        </Box>
        {wasMissed && (
          <Tag size="sm" variant="outline" flex="none" mt="2px">
            missed
          </Tag>
        )}
      </Box>
      {isOpen && (
        <Box
          id={answerId}
          px={4}
          pb={4}
          pl={12}
          borderTopWidth="1px"
          borderColor="surface-border"
          fontSize={15}
        >
          {card.answer.map((paragraph, i) => (
            <Text key={i} mt={3}>
              <InlineMarkdown text={paragraph} />
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}
