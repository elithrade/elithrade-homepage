import type { ReactNode } from 'react'
import Logo from './logo'
import {
  Container,
  Box,
  Link,
  Stack,
  Heading,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
  IconButton,
  useColorModeValue,
  type BoxProps,
  type LinkProps
} from '@chakra-ui/react'
import { DownloadIcon, HamburgerIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import ThemeToggleButton from './theme-toggle-button'
import { IoLogoGithub } from 'react-icons/io5'
import { CV_URL } from '../libs/cv'

type LinkItemProps = LinkProps & {
  href: string
  path: string
  children: ReactNode
}

// Highlights the current section: /works is active on /works/<id> too.
const isActive = (path: string, href: string) =>
  path === href || (href !== '/' && path.startsWith(`${href}/`))

const LinkItem = ({
  href,
  path,
  children,
  isExternal,
  ...props
}: LinkItemProps) => {
  const active = isActive(path, href)
  return (
    <Link
      // Internal links use next/link for client-side navigation, which also
      // lets the page transition animation run. Other links (GitHub, the CV)
      // are plain anchors; isExternal additionally opens them in a new tab.
      as={href.startsWith('/') ? NextLink : undefined}
      href={href}
      p={2}
      borderRadius="md"
      aria-current={active ? 'page' : undefined}
      // The active link uses the accent, which matches the theme toggle.
      bg={active ? 'accent-solid' : undefined}
      color={active ? 'on-accent' : 'chakra-body-text'}
      isExternal={isExternal}
      {...props}
    >
      {children}
    </Link>
  )
}

type NavbarProps = BoxProps & {
  path: string
}

const Navbar = (props: NavbarProps) => {
  const { path } = props

  return (
    <Box
      position="fixed"
      as="nav"
      w="100%"
      bg={useColorModeValue('#ffffff40', '#20202380')}
      style={{ backdropFilter: 'blur(10px)' }}
      zIndex={1}
      {...props}
    >
      <Container
        display="flex"
        p={2}
        maxW="container.lg"
        wrap="wrap"
        align="center"
        justify="space-between"
      >
        <Flex align="center" mr={5}>
          <Heading as="h1" size="lg" letterSpacing={'tighter'}>
            <Logo />
          </Heading>
        </Flex>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          display={{ base: 'none', md: 'flex' }}
          width={{ base: 'full', md: 'auto' }}
          alignItems="center"
          flexGrow={1}
          mt={{ base: 4, md: 0 }}
        >
          <LinkItem href="/works" path={path}>
            Works
          </LinkItem>
          <LinkItem
            href="https://github.com/elithrade"
            display="inline-flex"
            alignItems="center"
            style={{ gap: 4 }}
            path={path}
            isExternal={true}
          >
            <IoLogoGithub />
            GitHub
          </LinkItem>
          {/* Same tab: the CV is served as an attachment, so it downloads
              without leaving the page. */}
          <LinkItem
            href={CV_URL}
            display="inline-flex"
            alignItems="center"
            style={{ gap: 4 }}
            path={path}
          >
            <DownloadIcon boxSize={3.5} />
            CV
          </LinkItem>
        </Stack>
        <Box flex={1} align="right">
          <ThemeToggleButton />
          <Box ml={2} display={{ base: 'inline-block', md: 'none' }}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                variant="outline"
                aria-label="Options"
              />
              <MenuList>
                <MenuItem as={NextLink} href="/">
                  About
                </MenuItem>
                <MenuItem as={NextLink} href="/works">
                  Works
                </MenuItem>
                <MenuItem as={Link} href="https://github.com/elithrade">
                  GitHub
                </MenuItem>
                <MenuItem as={Link} href={CV_URL}>
                  Download CV
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Navbar
