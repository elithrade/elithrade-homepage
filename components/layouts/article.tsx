import type { ReactNode } from 'react'
import { motion, type Transition, type Variants } from 'framer-motion'
import Head from 'next/head'
import { GridItemStyle } from '../grid-item'

const variants: Variants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: 20 }
}

// 'easeInOut' is an easing name, not a transition type, so framer-motion
// ignores it and uses its default. Kept as-is to preserve the existing
// animation; the cast only satisfies the type checker.
const transition = { duration: 0.4, type: 'easeInOut' } as unknown as Transition

type LayoutProps = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title }: LayoutProps) => (
  <motion.article
    initial="hidden"
    animate="enter"
    exit="exit"
    variants={variants}
    transition={transition}
    style={{ position: 'relative' }}
  >
    <>
      {title && (
        <Head>
          <title>{title} - Bin Hu</title>
        </Head>
      )}
      {children}
      <GridItemStyle />
    </>
  </motion.article>
)

export default Layout
