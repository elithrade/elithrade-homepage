import type { ReactNode } from 'react'
import NextLink from 'next/link'
import Image, { type ImageProps } from 'next/image'
import { Box, Text, LinkBox, LinkOverlay } from '@chakra-ui/react'
import { Global } from '@emotion/react'

type GridItemProps = {
  children?: ReactNode
  href: string
  title: string
  thumbnail: ImageProps['src']
}

export const GridItem = ({
  children,
  href,
  title,
  thumbnail
}: GridItemProps) => (
  <Box w="100%" align="center">
    <LinkBox cursor="pointer">
      <Image
        src={thumbnail}
        alt={title}
        className="grid-item-thumbnail"
        placeholder="blur"
        loading="lazy"
      />
      <LinkOverlay href={href} target="_blank">
        <Text mt={2}>{title}</Text>
      </LinkOverlay>
      <Text fontSize={14}>{children}</Text>
    </LinkBox>
  </Box>
)

type WorkGridItemProps = {
  children?: ReactNode
  id: string
  title: string
  // Works don't have thumbnails yet; next/image then renders an <img> with
  // no src, exactly as before the TypeScript migration.
  thumbnail: ImageProps['src'] | undefined
}

export const WorkGridItem = ({
  children,
  id,
  title,
  thumbnail
}: WorkGridItemProps) => (
  <Box w="100%" align="center">
    <NextLink href={`/work/${id}`}>
      <LinkBox cursor="pointer">
        <Image
          src={thumbnail as ImageProps['src']}
          alt={title}
          className="grid-item-thumbnail"
        />
        <Text mt={2} fontSize={20}>
          {title}
        </Text>
        <Text fontSize={14}>{children}</Text>
      </LinkBox>
    </NextLink>
  </Box>
)

export const GridItemStyle = () => (
  <Global
    styles={`
    .grid-itemthumbnail {
      border-radius: 12px;
    }
  `}
  />
)
