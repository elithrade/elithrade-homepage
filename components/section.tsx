import type { ComponentType, ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { chakra, shouldForwardProp, type ChakraProps } from '@chakra-ui/react'

// Chakra's `transition` style prop (a CSS string) clashes with framer-motion's
// `transition` object. shouldForwardProp sends `transition` to motion.div, so
// type it as framer-motion's.
type StyledDivProps = Omit<ChakraProps, 'transition'> &
  Pick<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition'> & {
    children?: ReactNode
  }

const StyledDiv = chakra(motion.div, {
  shouldForwardProp: (prop: string) => {
    return shouldForwardProp(prop) || prop === 'transition'
  }
}) as ComponentType<StyledDivProps>

type SectionProps = {
  children?: ReactNode
  delay?: number
}

const Section = ({ children, delay = 0 }: SectionProps) => (
  <StyledDiv
    initial={{ y: 10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8, delay }}
    mb={6}
  >
    {children}
  </StyledDiv>
)

export default Section
