import { useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Heading, Text, Wrap } from '@chakra-ui/react'
import { InlineMarkdown, plainText } from './inline-markdown'
import { PrimaryButton, SecondaryButton } from './lesson-buttons'
import { plural, type CardInSection } from '../libs/lessons'

type PracticeProps = {
  /** What is being practised, such as a section's title. */
  title: string
  cards: CardInSection[]
  /** Called once per answered card. */
  onResult: (cardId: string, missed: boolean) => void
  onExit: () => void
  /** The finished round's way out, such as "Back to the section". */
  exitLabel: string
}

/**
 * One card at a time: the question, then the answer on request, then "Got
 * it" or "Missed it". A finished round offers the missed cards again.
 */
export const Practice = ({
  title,
  cards,
  onResult,
  onExit,
  exitLabel
}: PracticeProps) => {
  const [round, setRound] = useState(cards)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [missedIds, setMissedIds] = useState<string[]>([])
  const headingRef = useRef<HTMLHeadingElement>(null)

  // The button that started the round, or the one just pressed, is gone, so
  // move focus to the new card's question (or the summary) for keyboard and
  // screen reader users.
  useEffect(() => {
    headingRef.current?.focus()
  }, [index, round])

  const done = index >= round.length
  const current = done ? null : round[index]

  const answer = (missed: boolean) => {
    if (current === null) return
    onResult(current.card.id, missed)
    if (missed) setMissedIds(ids => [...ids, current.card.id])
    setIndex(index + 1)
    setRevealed(false)
  }

  const again = () => {
    setRound(round.filter(c => missedIds.includes(c.card.id)))
    setMissedIds([])
    setIndex(0)
    setRevealed(false)
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={2}>
        <Text fontSize={14} color="text-muted">
          Practice · {plainText(title)}
        </Text>
        <Button variant="link" color="accent" fontSize={14} onClick={onExit}>
          End practice
        </Button>
      </Flex>
      <Box
        role="progressbar"
        aria-label="Practice progress"
        aria-valuemin={0}
        aria-valuemax={round.length}
        aria-valuenow={index}
        h="4px"
        borderRadius="full"
        bg="surface-border"
        overflow="hidden"
        mb={6}
      >
        <Box
          h="100%"
          w={`${(100 * index) / round.length}%`}
          bg="accent-solid"
          transition="width 0.2s ease"
        />
      </Box>

      {current ? (
        <>
          <Text fontSize={14} color="text-muted" mb={2}>
            <span>{`Card ${index + 1} of ${round.length}`}</span>
            {' · '}
            {current.section.n}. {plainText(current.section.title)}
          </Text>
          <Box
            p={6}
            borderRadius="lg"
            bg="surface"
            borderWidth="1px"
            borderColor="surface-border"
          >
            <Heading
              ref={headingRef}
              tabIndex={-1}
              as="h2"
              fontSize={20}
              fontWeight={600}
              lineHeight={1.45}
              _focus={{ outline: 'none' }}
            >
              <InlineMarkdown text={current.card.question} />
            </Heading>
            {revealed ? (
              <>
                <Box
                  mt={4}
                  borderTopWidth="1px"
                  borderColor="surface-border"
                  fontSize={15}
                >
                  {current.card.answer.map((paragraph, i) => (
                    <Text key={i} mt={3}>
                      <InlineMarkdown text={paragraph} />
                    </Text>
                  ))}
                </Box>
                <Wrap spacing={2} mt={5}>
                  <SecondaryButton onClick={() => answer(true)}>
                    Missed it
                  </SecondaryButton>
                  <PrimaryButton onClick={() => answer(false)}>
                    Got it
                  </PrimaryButton>
                </Wrap>
              </>
            ) : (
              <>
                <Text mt={4} fontSize={14} color="text-muted">
                  Answer it out loud first.
                </Text>
                <PrimaryButton mt={4} onClick={() => setRevealed(true)}>
                  Show answer
                </PrimaryButton>
              </>
            )}
          </Box>
        </>
      ) : (
        <Box
          p={6}
          borderRadius="lg"
          bg="surface"
          borderWidth="1px"
          borderColor="surface-border"
        >
          <Heading
            ref={headingRef}
            tabIndex={-1}
            as="h2"
            fontSize={20}
            fontWeight={600}
            mb={2}
            _focus={{ outline: 'none' }}
          >
            Round finished
          </Heading>
          <Text color="text-muted" mb={5}>
            You got {round.length - missedIds.length} of {round.length}.{' '}
            {missedIds.length > 0
              ? `${plural(missedIds.length, 'card')} to review again.`
              : 'Nothing to review.'}
          </Text>
          <Wrap spacing={2}>
            {missedIds.length > 0 && (
              <PrimaryButton onClick={again}>
                Practice the {missedIds.length} missed
              </PrimaryButton>
            )}
            <SecondaryButton onClick={onExit}>{exitLabel}</SecondaryButton>
          </Wrap>
        </Box>
      )}
    </Box>
  )
}
